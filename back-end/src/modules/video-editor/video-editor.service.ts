import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { spawn } from "child_process";
import ffmpeg from "fluent-ffmpeg";
import { getDb } from "../../common/services/firebase";
import s3Service from "../../common/services/s3.service";
import { VideoTask, ClipSelection } from "./video-editor.model";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

// Create temp directory inside the workspace as per security guidelines
const TEMP_DIR = path.join(__dirname, "../../../temp");

export class VideoEditorService {
  private static instance: VideoEditorService;
  
  // In-memory FIFO queue for video exports
  private exportQueue: Array<{
    taskId: string;
    clips: ClipSelection[];
    io: any;
    resolve: (url: string) => void;
    reject: (err: Error) => void;
  }> = [];
  private isProcessingQueue = false;

  private constructor() {
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
    }
  }

  public static getInstance(): VideoEditorService {
    if (!VideoEditorService.instance) {
      VideoEditorService.instance = new VideoEditorService();
    }
    return VideoEditorService.instance;
  }

  private getCollection() {
    const db = getDb();
    return db.collection("videoTasks");
  }

  /**
   * Start downloading a YouTube video asynchronously
   */
  public async startDownload(url: string, io: any): Promise<string> {
    const taskId = uuidv4();
    const localRawPath = path.join(TEMP_DIR, `${taskId}_raw.mp4`);
    const s3Key = `videos/${taskId}_raw.mp4`;

    const task: VideoTask = {
      id: taskId,
      url,
      status: "downloading",
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save initial state to Firestore
    await this.getCollection().doc(taskId).set(task);

    // Run download in background
    this.runDownloadBackground(taskId, url, localRawPath, s3Key, io).catch((err) => {
      console.error(`Background download failed for task ${taskId}:`, err);
    });

    return taskId;
  }

  private async runDownloadBackground(
    taskId: string,
    url: string,
    localPath: string,
    s3Key: string,
    io: any
  ): Promise<void> {
    try {
      console.log(`Starting YouTube download for task ${taskId} using yt-dlp: ${url}`);

      // Run yt-dlp to download the video
      // Prefer standard 360p combined format (18), fallback to worst mp4 or lowest
      const ytDlpProcess = spawn("yt-dlp", [
        "-f", "18/worst[ext=mp4]/lowest",
        "-o", localPath,
        url
      ]);

      await new Promise<void>((resolve, reject) => {
        let errorOutput = "";

        ytDlpProcess.stdout.on("data", (data) => {
          const lines = data.toString().split("\n");
          for (const line of lines) {
            // Match progress format: [download]  12.3% of ...
            const match = line.match(/\[download\]\s+(\d+\.\d+)%/);
            if (match) {
              const percent = Math.round(parseFloat(match[1]));
              // Keep progress strictly under 95% during download (95% onwards is reserved for upload to S3)
              const mappedProgress = Math.round(percent * 0.9);
              this.updateTaskProgress(taskId, "downloading", mappedProgress, io);
            }
          }
        });

        ytDlpProcess.stderr.on("data", (data) => {
          errorOutput += data.toString();
        });

        ytDlpProcess.on("close", (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`yt-dlp exited with code ${code}. Error: ${errorOutput}`));
          }
        });
      });

      console.log(`Successfully downloaded YouTube video locally for task ${taskId}`);

      // Extract metadata before deleting local file
      const metadata = await this.probeVideo(localPath);

      // Upload file to S3
      this.updateTaskProgress(taskId, "downloading", 95, io);
      await s3Service.uploadFile(localPath, s3Key, "video/mp4");

      // Generate Presigned URL
      const presignedUrl = await s3Service.getPresignedUrl(s3Key);

      // Update task state to downloaded
      const updatedData = {
        status: "downloaded" as const,
        progress: 100,
        s3Key,
        presignedUrl,
        metadata,
        updatedAt: new Date(),
      };

      await this.getCollection().doc(taskId).update(updatedData);

      // Notify clients
      if (io) {
        io.to(taskId).emit("video_progress", { taskId, ...updatedData });
      }

      // Cleanup local temp file
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }

      console.log(`Finished download background job for task ${taskId}`);
    } catch (err: any) {
      console.error(`Error in runDownloadBackground for task ${taskId}:`, err);
      
      const errorMsg = err.message || "Failed to download video";
      await this.getCollection().doc(taskId).update({
        status: "failed",
        error: errorMsg,
        updatedAt: new Date(),
      });

      if (io) {
        io.to(taskId).emit("video_progress", {
          taskId,
          status: "failed",
          error: errorMsg,
        });
      }

      // Cleanup local temp file on error
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    }
  }

  /**
   * Run ffprobe to get duration, width, height
   */
  private probeVideo(filePath: string): Promise<{ duration: number; width: number; height: number; hasAudio: boolean }> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          return reject(err);
        }

        const duration = metadata.format?.duration || 0;
        const videoStream = metadata.streams?.find((s) => s.codec_type === "video");
        const width = videoStream?.width || 0;
        const height = videoStream?.height || 0;
        const hasAudio = metadata.streams?.some((s) => s.codec_type === "audio") || false;

        resolve({ duration, width, height, hasAudio });
      });
    });
  }

  private async updateTaskProgress(taskId: string, status: string, progress: number, io: any) {
    try {
      await this.getCollection().doc(taskId).update({
        status,
        progress,
        updatedAt: new Date(),
      });
      if (io) {
        io.to(taskId).emit("video_progress", { taskId, status, progress });
      }
    } catch (err) {
      console.error(`Error updating progress for ${taskId}:`, err);
    }
  }

  /**
   * Start exporting/merging video clips asynchronously (handles queueing)
   */
  public async startExport(taskId: string, clips: ClipSelection[], io: any): Promise<void> {
    // Verify task exists and is downloaded
    const doc = await this.getCollection().doc(taskId).get();
    if (!doc.exists) {
      throw new Error(`Video task ${taskId} not found`);
    }

    const task = doc.data() as VideoTask;
    if (task.status !== "downloaded" && task.status !== "completed" && task.status !== "failed") {
      throw new Error(`Video is not ready for editing (current status: ${task.status})`);
    }

    // Set status to exporting, reset progress
    await this.getCollection().doc(taskId).update({
      status: "exporting",
      progress: 0,
      updatedAt: new Date(),
    });

    if (io) {
      io.to(taskId).emit("video_progress", { taskId, status: "exporting", progress: 0 });
    }

    // Queue the job
    new Promise<string>((resolve, reject) => {
      this.exportQueue.push({ taskId, clips, io, resolve, reject });
      this.processQueue();
    }).catch((err) => {
      console.error(`Export queue job failed for task ${taskId}:`, err);
    });
  }

  private async processQueue() {
    if (this.isProcessingQueue || this.exportQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    const job = this.exportQueue.shift()!;
    const { taskId, clips, io, resolve, reject } = job;

    const localRawPath = path.join(TEMP_DIR, `${taskId}_export_raw.mp4`);
    const localOutputPath = path.join(TEMP_DIR, `${taskId}_export_result.mp4`);
    const s3ExportKey = `exports/${taskId}_result.mp4`;

    try {
      console.log(`Processing export job for task ${taskId}. Queue length left: ${this.exportQueue.length}`);

      // 1. Fetch task details from Firestore
      const doc = await this.getCollection().doc(taskId).get();
      const task = doc.data() as VideoTask;

      if (!task.s3Key) {
        throw new Error("S3 key for source video is missing");
      }

      // 2. Download raw video from S3 to temp local storage
      console.log(`Downloading raw video from S3 to local path: ${localRawPath}`);
      await this.downloadS3ToLocal(task.s3Key, localRawPath);

      // 3. Build FFmpeg command and apply edit/transitions
      console.log(`Starting FFmpeg processing for task ${taskId}`);
      const hasAudio = task.metadata?.hasAudio !== false;
      await this.processFFmpeg(localRawPath, localOutputPath, clips, hasAudio, (progressPercent) => {
        // Map 0-100% of FFmpeg export progress to 10% - 90% of overall export progress
        const overallProgress = Math.round(10 + progressPercent * 0.8);
        this.updateTaskProgress(taskId, "exporting", overallProgress, io);
      });

      // 4. Upload finished result to S3
      console.log(`Uploading exported video to S3 key: ${s3ExportKey}`);
      this.updateTaskProgress(taskId, "exporting", 95, io);
      await s3Service.uploadFile(localOutputPath, s3ExportKey, "video/mp4");

      // 5. Generate presigned URL for final video
      const presignedUrl = await s3Service.getPresignedUrl(s3ExportKey);

      const updatedData = {
        status: "completed" as const,
        progress: 100,
        s3Key: s3ExportKey, // Update key to final result
        presignedUrl,
        updatedAt: new Date(),
      };

      await this.getCollection().doc(taskId).update(updatedData);

      if (io) {
        io.to(taskId).emit("video_progress", { taskId, ...updatedData });
      }

      // Clean up temp files
      this.cleanupLocalFiles([localRawPath, localOutputPath]);
      
      console.log(`Finished export job for task ${taskId}`);
      resolve(presignedUrl);
    } catch (err: any) {
      console.error(`Export process failed for task ${taskId}:`, err);
      const errorMsg = err.message || "Failed to export video";

      await this.getCollection().doc(taskId).update({
        status: "failed",
        error: errorMsg,
        updatedAt: new Date(),
      });

      if (io) {
        io.to(taskId).emit("video_progress", {
          taskId,
          status: "failed",
          error: errorMsg,
        });
      }

      this.cleanupLocalFiles([localRawPath, localOutputPath]);
      reject(err);
    } finally {
      this.isProcessingQueue = false;
      // Process next item in queue
      setTimeout(() => this.processQueue(), 500);
    }
  }

  private async downloadS3ToLocal(s3Key: string, localPath: string): Promise<void> {
    const bucketName = process.env.AWS_S3_BUCKET || "video-editor-bucket";
    const region = process.env.AWS_REGION || "us-east-1";

    const config: any = {
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
      },
    };

    if (process.env.AWS_S3_ENDPOINT) {
      config.endpoint = process.env.AWS_S3_ENDPOINT;
      config.forcePathStyle = true;
    }

    const s3Client = new S3Client(config);
    const response = await s3Client.send(new GetObjectCommand({ Bucket: bucketName, Key: s3Key }));
    const body = response.Body;

    if (!body) {
      throw new Error("S3 download response body is empty");
    }

    const writeStream = fs.createWriteStream(localPath);
    await new Promise<void>((resolve, reject) => {
      (body as any).pipe(writeStream)
        .on("finish", resolve)
        .on("error", reject);
    });
  }

  /**
   * Process video editing through single-pass FFmpeg filter complex
   */
  private processFFmpeg(
    inputPath: string,
    outputPath: string,
    clips: ClipSelection[],
    hasAudio: boolean,
    onProgress: (percent: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (clips.length === 0) {
        return reject(new Error("No clips selected for export."));
      }

      // Helper to calculate progress percentage using timemark and target duration
      // to avoid fluent-ffmpeg's incorrect percent calculations (based on input video duration)
      const getProgressPercent = (progress: any, targetDuration: number): number | null => {
        if (progress.timemark) {
          const parts = progress.timemark.split(":");
          if (parts.length === 3) {
            const seconds = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseFloat(parts[2]);
            if (!isNaN(seconds) && targetDuration > 0) {
              return Math.min(99, Math.round((seconds / targetDuration) * 100));
            }
          }
        }
        return null;
      };

      // Check if it's a simple trim of 1 clip without transition
      if (clips.length === 1 && (!clips[0].transition || clips[0].transition.type === "none")) {
        const clip = clips[0];
        const duration = clip.end - clip.start;
        const cmd = ffmpeg(inputPath)
          .setStartTime(clip.start)
          .setDuration(duration);

        if (!hasAudio) {
          cmd.noAudio();
        }

        cmd.output(outputPath)
          .on("progress", (progress) => {
            const pct = getProgressPercent(progress, duration);
            if (pct !== null) {
              onProgress(pct);
            } else if (progress.percent) {
              onProgress(Math.min(99, progress.percent));
            }
          })
          .on("end", () => {
            onProgress(100);
            resolve();
          })
          .on("error", (err) => reject(err))
          .run();
        return;
      }

      // Build FFmpeg complex filter
      const filters: string[] = [];
      
      // 1. Define trims for all clips
      for (let i = 0; i < clips.length; i++) {
        const start = clips[i].start;
        const duration = clips[i].end - start;
        filters.push(`[0:v]trim=start=${start}:duration=${duration},setpts=PTS-STARTPTS[v${i}]`);
        if (hasAudio) {
          filters.push(`[0:a]atrim=start=${start}:duration=${duration},asetpts=PTS-STARTPTS[a${i}]`);
        }
      }

      // 2. Chaining transition effects
      let currentV = "v0";
      let currentA = "a0";
      let currentDuration = clips[0].end - clips[0].start;

      for (let i = 1; i < clips.length; i++) {
        const clip = clips[i];
        const clipDuration = clip.end - clip.start;
        const trans = clips[i - 1].transition || { type: "none", duration: 1 };
        const type = trans.type;
        const duration = trans.duration;

        if (type === "none" || duration <= 0) {
          // Simply concat video and audio
          filters.push(`[${currentV}][v${i}]concat=n=2:v=1:a=0[vtemp${i}]`);
          currentV = `vtemp${i}`;

          if (hasAudio) {
            filters.push(`[${currentA}][a${i}]concat=n=2:v=0:a=1[atemp${i}]`);
            currentA = `atemp${i}`;
          }
          currentDuration += clipDuration;
        } else {
          // Calculate offset in the merged stream
          const offset = currentDuration - duration;
          if (offset < 0) {
            return reject(new Error("Transition duration is too long for the segment."));
          }
          
          filters.push(`[${currentV}][v${i}]xfade=transition=${type}:duration=${duration}:offset=${offset}[vtemp${i}]`);
          currentV = `vtemp${i}`;

          if (hasAudio) {
            filters.push(`[${currentA}][a${i}]acrossfade=d=${duration}[atemp${i}]`);
            currentA = `atemp${i}`;
          }
          currentDuration += clipDuration - duration;
        }
      }

      // Start building command
      const cmd = ffmpeg(inputPath)
        .complexFilter(filters.join("; "))
        .map(`[${currentV}]`);

      if (hasAudio) {
        cmd.map(`[${currentA}]`);
      } else {
        cmd.noAudio();
      }

      cmd.output(outputPath);

      cmd.on("progress", (progress) => {
        const pct = getProgressPercent(progress, currentDuration);
        if (pct !== null) {
          onProgress(pct);
        } else if (progress.percent) {
          onProgress(Math.min(99, progress.percent));
        }
      })
      .on("end", () => {
        onProgress(100);
        resolve();
      })
      .on("error", (err) => {
        console.error("FFmpeg compile error output:", err);
        reject(err);
      })
      .run();
    });
  }

  private cleanupLocalFiles(filePaths: string[]) {
    for (const filePath of filePaths) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Cleaned up temp local file: ${filePath}`);
        }
      } catch (err) {
        console.error(`Failed to delete temp file ${filePath}:`, err);
      }
    }
  }

  /**
   * Fetch current task status
   */
  public async getTask(taskId: string): Promise<VideoTask | null> {
    const doc = await this.getCollection().doc(taskId).get();
    if (!doc.exists) {
      return null;
    }
    
    const task = doc.data() as VideoTask;
    
    // Refresh presigned URL if task is completed
    if (task.status === "completed" && task.s3Key) {
      task.presignedUrl = await s3Service.getPresignedUrl(task.s3Key);
    }
    
    return task;
  }
}
