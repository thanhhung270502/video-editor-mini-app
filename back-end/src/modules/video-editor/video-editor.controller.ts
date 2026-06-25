import { Request, Response } from "express";
import { VideoEditorService } from "./video-editor.service";
import { ClipSelection } from "./video-editor.model";

export class VideoEditorController {
  private service = VideoEditorService.getInstance();

  /**
   * Post endpoint to initiate downloading YouTube video
   */
  public download = async (req: Request, res: Response): Promise<void> => {
    try {
      const { url } = req.body;
      if (!url) {
        res.status(400).json({ success: false, message: "YouTube URL is required." });
        return;
      }

      // Check if it's a valid YouTube link
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
      if (!youtubeRegex.test(url)) {
        res.status(400).json({ success: false, message: "Invalid YouTube URL format." });
        return;
      }

      const io = req.app.get("io");
      const taskId = await this.service.startDownload(url, io);

      res.status(202).json({
        success: true,
        message: "Video download started.",
        data: { taskId },
      });
    } catch (err: any) {
      console.error("Error in download controller:", err);
      res.status(500).json({
        success: false,
        message: err.message || "Failed to start downloading video.",
      });
    }
  };

  /**
   * Post endpoint to initiate exporting edited clips
   */
  public export = async (req: Request, res: Response): Promise<void> => {
    try {
      const { taskId, clips } = req.body;
      if (!taskId) {
        res.status(400).json({ success: false, message: "Task ID is required." });
        return;
      }

      if (!clips || !Array.isArray(clips) || clips.length === 0) {
        res.status(400).json({ success: false, message: "At least one clip selection is required." });
        return;
      }

      // Validate clips structure and duration
      for (const clip of clips as ClipSelection[]) {
        if (typeof clip.start !== "number" || typeof clip.end !== "number") {
          res.status(400).json({ success: false, message: "Clip start and end must be numbers." });
          return;
        }
        if (clip.start < 0 || clip.end <= clip.start) {
          res.status(400).json({ success: false, message: `Invalid clip timestamps: start=${clip.start}, end=${clip.end}` });
          return;
        }
        if (clip.transition) {
          if (typeof clip.transition.duration !== "number" || clip.transition.duration < 0) {
            res.status(400).json({ success: false, message: "Transition duration must be a non-negative number." });
            return;
          }
          if (clip.transition.duration > (clip.end - clip.start)) {
            res.status(400).json({
              success: false,
              message: `Transition duration (${clip.transition.duration}s) cannot be longer than clip duration (${clip.end - clip.start}s).`,
            });
            return;
          }
        }
      }

      const io = req.app.get("io");
      await this.service.startExport(taskId, clips, io);

      res.status(202).json({
        success: true,
        message: "Video export queued.",
      });
    } catch (err: any) {
      console.error("Error in export controller:", err);
      res.status(500).json({
        success: false,
        message: err.message || "Failed to start exporting video.",
      });
    }
  };

  /**
   * Get endpoint to query current task status
   */
  public status = async (req: Request, res: Response): Promise<void> => {
    try {
      const { taskId } = req.params;
      if (!taskId) {
        res.status(400).json({ success: false, message: "Task ID is required." });
        return;
      }

      const task = await this.service.getTask(taskId);
      if (!task) {
        res.status(404).json({ success: false, message: "Task not found." });
        return;
      }

      res.json({
        success: true,
        data: task,
      });
    } catch (err: any) {
      console.error("Error in status controller:", err);
      res.status(500).json({
        success: false,
        message: err.message || "Failed to get task status.",
      });
    }
  };
}
