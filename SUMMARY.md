# Case Study Submission Summary: Video Editor Mini App

This document provides a summary of the implementation, design decisions, and scaling considerations for the Video Editor Mini App case study.

---

## 🎬 Project Overview & Tech Stack
The application is a full-stack web app that allows content creators to paste a YouTube video link, select multiple time-range clips, preview transitions, and export/download the merged video.

- **Frontend:** Next.js (React 19, Tailwind CSS) — features an interactive timeline editor, clip management list, and real-time socket progress status.
- **Backend:** Express (TypeScript, Node.js) — orchestrates video downloading, slicing, and transition effects.
- **Database & State:** Firebase Firestore — tracks tasks and persistent operational state.
- **Storage:** AWS S3 (simulated locally using LocalStack) — holds the raw source videos and final exported results.
- **Video Processing:** `yt-dlp` (via subprocess) for reliable downloads, and FFmpeg (via `fluent-ffmpeg`) for rendering.
- **Real-time Communication:** Socket.io — handles instant progress streaming and completed video download links.

---

## ⚙️ Low-Resource Optimization (0.5 vCPU, 1GB RAM)
Designed to run stably under constrained cloud environments (such as AWS ECS Fargate with 0.5 vCPU / 1GB RAM):

1. **Format Constraints on Ingestion:** `yt-dlp` is configured with `-f 18/worst[ext=mp4]/lowest` to force the download of standard **360p video** (~50–150 MB). This reduces memory consumption during editing, bandwidth usage, and S3 upload time.
2. **Sequential FIFO Job Queue:** FFmpeg is CPU and memory-intensive. We process export jobs sequentially via a single-process in-memory queue (`exportQueue`) to prevent OOM (Out of Memory) crashes or CPU starvation under concurrent user load.
3. **Single-Pass Complex Filter:** Rather than saving intermediate video segments to disk and merging them in separate commands (multiplying disk I/O), we use a single complex FFmpeg filter graph. Trimming, PTS resetting, cross-fades (`xfade`/`acrossfade`), and concatenation happen in a single invocation.
4. **Disk & Memory Offloading:** Heavy video payloads bypass Node.js heap buffers entirely. Files are uploaded directly to S3, and clients download them using S3 presigned URLs. Local files in `/app/temp` are deleted immediately using `fs.unlinkSync` inside a `finally` block.

---

## 📈 Scaling Analysis (1,000+ Concurrent Users)
If 1,000 users submitted videos simultaneously, a single-instance, stateful prototype would fail due to FFmpeg queue starvation, OOM from parallel downloads, stateful Socket.io connections, and Firestore write rates.

### Production-Grade Architecture Fixes:
1. **Decoupled Architecture (Microservices):** Separate API servers from processing worker nodes. API nodes only handle routing, validation, and enqueueing, returning a `202 Accepted` status immediately.
2. **Durable Message Queue (AWS SQS):** Replace the in-memory array queue with AWS SQS to store export/download jobs safely and scale workers horizontally.
3. **Autoscaling Workers (ECS Fargate):** Set up a pool of workers to pull tasks from SQS, scaling dynamically based on queue depth metrics.
4. **Distributed Websockets (Socket.io Redis Adapter):** Scale API nodes horizontally using the Redis adapter so WebSocket events propagate across all server instances.
5. **Write Reduction & Caching:** Write real-time progress percentages to Redis (ephemeral) rather than Firestore, and only commit terminal states (`completed`, `failed`) to Firestore to avoid database throttling.

---

## 📖 Key Project Documents
For detailed explanations, please refer to:
- `README.md` — Quick Start instructions, architecture flow diagrams, and details on scaling answers.
- `DESIGN.md` — Comprehensive technical notes, design tradeoffs, resource management details, and conscious omissions.
