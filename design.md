# Design Document — Video Editor Mini App

This document covers architecture decisions, tradeoffs, resource management strategy, and the scaling analysis required by the case study.

---

## 1. Architecture Overview

The system is a two-tier web app: a Next.js frontend and an Express backend. All heavy processing (download, encoding) happens server-side. Video bytes never travel through the Node.js response stream — they go directly from the processing pipeline to S3, and the client receives a presigned URL to download the result.

### Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  DOWNLOAD FLOW                                                      │
│                                                                     │
│  Client ──POST /api/video/download──► Controller                    │
│                │                          │                         │
│          (202 + taskId)            yt-dlp subprocess                │
│                │                     (360p mp4)                     │
│                │                          │                         │
│         Socket.io ◄────── progress ──── S3 upload (raw)             │
│         video_progress                    │                         │
│                │                   Firestore update                 │
│                │                   (status: downloaded)             │
│                ▼                          │                         │
│         UI shows player ◄── presigned URL ┘                         │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  EXPORT FLOW                                                        │
│                                                                     │
│  Client ──POST /api/video/export──► Controller ──► FIFO Queue       │
│                │                                        │           │
│          (202 queued)                    S3 download (raw mp4)      │
│                │                                        │           │
│         Socket.io ◄──── progress ──── FFmpeg process                │
│         video_progress               (trim/concat/xfade)            │
│                │                                        │           │
│                │                         S3 upload (result mp4)     │
│                │                                        │           │
│         UI download ◄────── presigned URL ──────────────┘           │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Map

| Layer | Technology | Role |
|-------|-----------|------|
| Frontend | Next.js 16 / React 19 | UI, timeline editor, clip list |
| Backend | Express + TypeScript | API, task orchestration |
| Download | `yt-dlp` (subprocess) | Fetch YouTube video |
| Encoding | FFmpeg via `fluent-ffmpeg` | Trim, merge, transitions |
| Storage | AWS S3 / LocalStack | Video file storage |
| Task state | Firebase Firestore | Download/export status per task |
| Real-time | Socket.io | Push progress to client |

---

## 2. Key Design Decisions & Tradeoffs

### 2.1 yt-dlp over ytdl-core

`@distube/ytdl-core` (included in `package.json` as a fallback reference) is frequently broken by YouTube's format changes and is effectively unmaintained for production use. `yt-dlp` is a battle-tested CLI tool with active maintenance, broad format support, and reliable extraction.

Format flag used: `-f 18/worst[ext=mp4]/lowest`

This prefers format 18 (YouTube's 360p combined video+audio stream, ~50–150 MB for typical short clips) and falls back to the smallest available mp4. This caps download size to stay well within the 1 GB RAM limit and reduces S3 upload time.

**Tradeoff:** Requires `yt-dlp` binary installed in the container. The Dockerfile handles this via `pip install yt-dlp`.

### 2.2 Sequential FIFO Export Queue

FFmpeg is CPU and memory intensive. Running two concurrent export jobs on a 0.5 vCPU / 1 GB container would cause one of: OOM kill, CPU starvation, or both. The export service uses a single in-memory FIFO queue that processes one job at a time.

```
// back-end/src/modules/video-editor/video-editor.service.ts
private exportQueue: Array<{ taskId, clips, io, resolve, reject }> = [];
private isProcessingQueue = false;
```

**Tradeoff:** Under load, jobs queue up. For a prototype running solo this is acceptable. For production, replace with SQS + a dedicated worker fleet (see scaling section).

### 2.3 S3 + Presigned URLs

Videos are stored in S3 (LocalStack locally, real S3 in production) rather than served from the Express process. After upload, the backend generates a presigned `GetObject` URL (1 hour TTL) and sends it to the client via Socket.io.

Benefits:
- Download bypasses the Node.js process entirely — no buffering of video bytes in heap
- S3 handles bandwidth and concurrent downloads at no extra server load
- LocalStack makes dev setup fully offline

**Tradeoff:** Presigned URLs expire (1 hour). The `GET /api/video/status/:taskId` endpoint refreshes the URL on demand for tasks that are already completed.

### 2.4 Firestore for Task State

Each video operation maps to a `videoTask` document in Firestore. The schema tracks `status`, `progress`, `s3Key`, `presignedUrl`, and `metadata`. Firestore was chosen for:

- Zero schema migration — document model fits flexible task state evolution
- Firebase Admin SDK already in the dependency tree for this starter
- Sufficient throughput for a single-server prototype

**Tradeoff:** Vendor lock-in to GCP. For production, a Postgres `video_tasks` table would be a more portable choice.

### 2.5 Socket.io for Real-Time Progress

Download and export are async background jobs. Rather than having the client poll `GET /api/video/status/:taskId` every second, Socket.io pushes updates. Each client joins a room named after their `taskId`, so progress events are scoped per-user with no broadcast noise.

```
// Client joins task room
socket.emit("join_task", taskId);

// Server emits progress into that room
io.to(taskId).emit("video_progress", { taskId, status, progress, presignedUrl });
```

**Tradeoff:** Socket.io connections are stateful. Horizontal scaling requires a shared adapter (Redis). For a single-node container this is fine.

### 2.6 FFmpeg Single-Pass Filter Complex

Trim, concat, and all transitions are applied in a single FFmpeg `complexFilter` invocation rather than piping multiple FFmpeg processes. This avoids writing intermediate video files to disk between operations, which on a 1 GB container would quickly exhaust both disk and memory.

The filter graph pattern is:
1. `trim` + `atrim` each clip to its selected range
2. `xfade` + `acrossfade` for transitions, `concat` for hard cuts
3. Single output mapped from the final filter node

**Tradeoff:** Complex filter graphs are harder to debug. A single invalid timestamp or transition duration longer than its clip will fail the entire FFmpeg command. Input validation in the controller guards against the most common cases.

---

## 3. Resource Management (0.5 vCPU / 1 GB RAM)

The app is designed to run on AWS ECS Fargate with `--memory=1g --cpus=0.5`. The key constraints:

| Resource | Pressure point | Mitigation |
|----------|---------------|-----------|
| RAM | FFmpeg decoding + encoding buffers | Sequential export queue; 360p download limit |
| RAM | yt-dlp download | File streamed to disk, not buffered in Node heap |
| Disk | Temp video files | Deleted immediately after S3 upload |
| CPU | FFmpeg encode | Sequential queue; one job at a time |
| Bandwidth | Serving video files | S3 presigned URLs bypass the app server |

**Current gap:** Multiple concurrent download requests each spawn a `yt-dlp` subprocess. With no concurrency limit on downloads, five simultaneous 150 MB downloads could push ~750 MB into temp disk and spawn five processes competing for CPU. A production-hardened version would add a download semaphore capping concurrent downloads at 2–3.

---

## 4. What I Chose Not to Build

| Feature | Reason |
|---------|--------|
| Authentication / user accounts | Not required by the spec. Adding auth would double the scope with no product value for a reviewer-run prototype. |
| Direct file upload (non-YouTube) | The spec says "Input a YouTube video URL". Supporting arbitrary uploads would require chunked multipart handling and a different ingest pipeline. Left as a future extension. |
| Spatial / region crop | The spec says "choose time ranges" — temporal selection only. Spatial crop would require a canvas-based UI and different FFmpeg filter arguments. |
| Frontend unit tests | Time budget of ~2 hours was spent on backend logic, which carries the majority of the complexity. Backend tests cover all three API endpoints including validation edge cases. Frontend components are thin wrappers over well-typed props. |
| Persistent job queue | An in-memory queue resets on restart. For the prototype use case (single reviewer session) this is acceptable. Production would use SQS or BullMQ with Redis. |
| Clip preview before export | Would require serving short FFmpeg previews on demand — significant added complexity. Users can use the "Preview Start/End" buttons to seek in the already-downloaded source video instead. |

---

## 5. Scaling Analysis — 1,000 Simultaneous Users

> The case study asks: "If 1,000 users submitted videos simultaneously, what would break first — and how would you fix it?"

### What breaks, in order

**1. FFmpeg export queue — breaks immediately**

The current queue processes one job at a time on a single process. 1,000 export jobs queue up behind each other. With a 30-second export average, the last user waits ~8 hours. The HTTP connection will have timed out long before that.

Fix: Decouple the export queue from the API server. Use AWS SQS as a durable queue and a separate fleet of ECS tasks (each running Node + FFmpeg) that consume jobs. Auto-scale the worker fleet based on `ApproximateNumberOfMessagesVisible`. The API server only enqueues and returns 202.

```
API server → SQS.sendMessage(job)
ECS worker fleet → SQS.receiveMessage → FFmpeg → S3 → update Firestore → Socket.io via Redis pub/sub
```

**2. Concurrent yt-dlp downloads — OOM within seconds**

1,000 simultaneous download requests spawn 1,000 `yt-dlp` processes. Each uses ~100–200 MB disk and non-trivial CPU. The 1 GB container dies.

Fix: Add a download semaphore limiting concurrent yt-dlp processes to 3–5. Beyond the limit, return 429 with a `Retry-After` header. Long term: same worker fleet pattern as exports — a download queue backed by SQS.

**3. Socket.io — cannot scale horizontally**

Socket.io connections are pinned to the process that accepted them. Adding a second API container means half the clients miss their progress events (they're emitted on a different process).

Fix: Socket.io Redis adapter. All nodes publish to a shared Redis channel; any node can emit to any room.

```
npm install @socket.io/redis-adapter
io.adapter(createAdapter(pubClient, subClient));
```

**4. Firestore write throughput**

1,000 active tasks each emitting progress updates every 1–2 seconds = ~500–1,000 writes/second. Firestore's free tier soft limit is 1 write/second per document, 1,000 writes/second per database. This approaches the ceiling quickly.

Fix: Write progress to Redis (ephemeral, low-latency) and only persist final status transitions (`downloading → downloaded`, `exporting → completed/failed`) to Firestore. This cuts Firestore writes by ~95%.

**5. S3 presigned URL generation**

At scale, generating a presigned URL per request is a CPU-bound crypto operation. At 1,000 requests it's negligible; at 100,000 it becomes measurable.

Fix: Cache presigned URLs in Redis with a TTL slightly shorter than the URL expiry. Only regenerate on cache miss.

### Summary

```
Current bottleneck order:
1. FFmpeg queue (single process) ← breaks first, by far
2. yt-dlp concurrency (OOM)
3. Socket.io statefulness (horizontal scaling blocker)
4. Firestore write rate
5. Presigned URL CPU cost

Production architecture for 1,000+ users:
API (stateless, N instances)
  └── SQS download queue → download workers (auto-scaled)
  └── SQS export queue  → FFmpeg workers  (auto-scaled)
  └── Redis             → Socket.io adapter + progress cache
  └── Firestore         → durable task state (terminal states only)
  └── S3                → video storage (scales natively)
```

S3 and Firestore (for terminal state writes) do not break under this load. The bottlenecks are all in the stateful, CPU-bound application layer.
