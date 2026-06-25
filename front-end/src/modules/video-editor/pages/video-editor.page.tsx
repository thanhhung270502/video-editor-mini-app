"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { getSocket, connectSocket, disconnectSocket } from "@/common/lib/socket";
import axiosInstance from "@/common/lib/axios";
import { Typography, Button, Card, Alert, Spinner } from "@/shared/components";
import { VideoPlayer } from "../components/video-player";
import { VideoTimeline } from "../components/video-timeline";
import { ClipList } from "../components/clip-list";

export interface ClipSelection {
  start: number;
  end: number;
  transition: {
    type: "none" | "fade" | "slideleft" | "slideright" | "slideup" | "slidedown";
    duration: number;
  };
}

export function VideoEditorPage() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<
    "idle" | "downloading" | "downloaded" | "exporting" | "completed" | "failed"
  >("idle");
  const [progress, setProgress] = useState(0);
  const [videoMetadata, setVideoMetadata] = useState<{
    duration: number;
    width: number;
    height: number;
  } | null>(null);
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
  const [clips, setClips] = useState<ClipSelection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Sync Socket.io for progress updates when a taskId is active
  useEffect(() => {
    if (!taskId) return;

    // Connect socket client
    const socket = connectSocket();

    // Join task channel room
    socket.emit("join_task", taskId);
    console.log(`Socket joining room for task: ${taskId}`);

    // Listen to background progress events
    socket.on("video_progress", (data: any) => {
      console.log("Received video progress update:", data);
      if (data.taskId !== taskId) return;

      if (data.status) {
        setTaskStatus(data.status);
      }
      if (typeof data.progress === "number") {
        setProgress(data.progress);
      }
      if (data.presignedUrl) {
        if (data.status === "completed") {
          // Completed export result URL
          setPresignedUrl(data.presignedUrl);
        } else if (data.status === "downloaded") {
          // Downloaded raw preview URL
          setPresignedUrl(data.presignedUrl);
        }
      }
      if (data.metadata) {
        setVideoMetadata(data.metadata);
      }
      if (data.error) {
        setError(data.error);
        toast.error(`Error: ${data.error}`);
        disconnectSocket();
      }

      // Cleanup socket connection when processing ends
      if (data.status === "completed" || data.status === "failed") {
        disconnectSocket();
      }
    });

    return () => {
      // Disconnect socket on unmount or task ID change
      disconnectSocket();
    };
  }, [taskId]);

  // Initiate YouTube download
  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;

    setLoading(true);
    setError(null);
    setTaskId(null);
    setTaskStatus("idle");
    setProgress(0);
    setVideoMetadata(null);
    setPresignedUrl(null);
    setClips([]);

    try {
      const response = await axiosInstance.post("/video/download", {
        url: youtubeUrl,
      });

      if (response.data?.success) {
        const id = response.data.data.taskId;
        setTaskId(id);
        setTaskStatus("downloading");
        toast.success("Download started. Checking file status...");
      } else {
        throw new Error(response.data?.message || "Failed to start downloading.");
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Failed to download YouTube video.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Submit clips list for merging
  const handleExport = async () => {
    if (!taskId || clips.length === 0) return;

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const response = await axiosInstance.post("/video/export", {
        taskId,
        clips: clips.map((c) => ({
          start: c.start,
          end: c.end,
          transition: c.transition.type !== "none" ? c.transition : undefined,
        })),
      });

      if (response.data?.success) {
        setTaskStatus("exporting");
        toast.success("Export queued. Merging clips...");
      } else {
        throw new Error(response.data?.message || "Failed to submit export job.");
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Failed to export video.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Seek video player to custom timestamp
  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Helper to append segment to list
  const handleAddClip = (start: number, end: number) => {
    setClips([
      ...clips,
      {
        start,
        end,
        transition: { type: "none", duration: 1.0 },
      },
    ]);
    toast.success("Segment added.");
  };

  // Helper to delete segment from list
  const handleRemoveClip = (index: number) => {
    setClips(clips.filter((_, i) => i !== index));
    toast.success("Segment removed.");
  };

  // Helper to reorder segment
  const handleReorderClips = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= clips.length) return;

    const newClips = [...clips];
    const temp = newClips[index];
    newClips[index] = newClips[targetIndex];
    newClips[targetIndex] = temp;
    setClips(newClips);
  };

  // Helper to edit transitions between clips
  const handleUpdateTransition = (
    index: number,
    type: ClipSelection["transition"]["type"],
    duration: number
  ) => {
    const newClips = [...clips];
    newClips[index] = {
      ...newClips[index],
      transition: { type, duration },
    };
    setClips(newClips);
  };

  // Reset page state to download another video
  const handleReset = () => {
    setYoutubeUrl("");
    setTaskId(null);
    setTaskStatus("idle");
    setProgress(0);
    setVideoMetadata(null);
    setPresignedUrl(null);
    setClips([]);
    setError(null);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h2" color="primary">
            Video Editor Mini App
          </Typography>
          <Typography variant="body" color="muted">
            Download YouTube videos, slice segments, apply transition effects, and export.
          </Typography>
        </div>
        {taskStatus !== "idle" && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Start New Edit
          </Button>
        )}
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* STEP 1: Paste URL form */}
      {taskStatus === "idle" && (
        <Card className="p-6">
          <form onSubmit={handleDownload} className="flex flex-col gap-4">
            <Typography variant="h4" color="primary">
              Load Video
            </Typography>
            <Typography variant="small" color="muted">
              Paste a YouTube video link to start editing. The video will be fetched and optimized to run on low-memory servers.
            </Typography>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="flex-1 rounded-md border border-white/10 bg-brand-primary-dark/50 px-4 py-3 text-sm text-white outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                disabled={loading}
              />
              <Button
                variant="primary"
                type="submit"
                disabled={!youtubeUrl.trim() || loading}
                loading={loading}
                loadingText="Initiating..."
                className="sm:w-auto"
              >
                Load Video
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* STEP 2: Download / Processing States */}
      {(taskStatus === "downloading" || taskStatus === "exporting") && (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <Spinner className="mb-4 size-10 text-brand-primary" />
          <Typography variant="h4" color="primary" className="mb-2 uppercase tracking-wide">
            {taskStatus === "downloading" ? "Downloading Video..." : "Processing & Exporting..."}
          </Typography>
          <Typography variant="body" color="muted" className="mb-6 max-w-md">
            {taskStatus === "downloading"
              ? "Fetching stream from YouTube and saving to cloud storage bucket..."
              : "Running FFmpeg on container. Building video frames and merging transition animations..."}
          </Typography>
          <div className="w-full max-w-md">
            <div className="flex justify-between mb-1.5">
              <Typography variant="small" color="muted" className="font-semibold">
                Progress
              </Typography>
              <Typography variant="small" color="primary" className="font-mono font-semibold">
                {progress}%
              </Typography>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-brand-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* STEP 3: Editing Workspace */}
      {(taskStatus === "downloaded" || taskStatus === "completed") && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main workspace (Video player + timeline) */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <Card className="overflow-hidden p-0">
              <VideoPlayer
                ref={videoRef}
                url={presignedUrl || undefined}
                onTimeUpdate={setCurrentTime}
              />
            </Card>

            {videoMetadata && (
              <VideoTimeline
                duration={videoMetadata.duration}
                currentTime={currentTime}
                onAddClip={handleAddClip}
                onSeek={handleSeek}
              />
            )}
          </div>

          {/* Right sidebar workspace (Clip list & Export actions) */}
          <div className="flex flex-col gap-6">
            <Card className="flex flex-col gap-6 p-5">
              <ClipList
                clips={clips}
                onRemoveClip={handleRemoveClip}
                onUpdateTransition={handleUpdateTransition}
                onReorder={handleReorderClips}
                onSeekToClip={handleSeek}
              />

              {clips.length > 0 && taskStatus === "downloaded" && (
                <div className="border-t border-white/5 pt-4">
                  <Button
                    variant="primary"
                    onClick={handleExport}
                    disabled={loading}
                    loading={loading}
                    loadingText="Queuing Export..."
                  >
                    Export Merged Video
                  </Button>
                </div>
              )}

              {taskStatus === "completed" && presignedUrl && (
                <div className="flex flex-col gap-4 border-t border-white/5 pt-4 text-center">
                  <Typography variant="h5" color="success">
                    🎉 Export Completed Successfully!
                  </Typography>
                  <Typography variant="small" color="muted">
                    Your file is ready to download from S3 storage.
                  </Typography>
                  <Button variant="success" href={presignedUrl} target="_blank" download>
                    📥 Download Result Video
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
