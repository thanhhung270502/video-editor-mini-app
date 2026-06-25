export interface ClipSelection {
  start: number;
  end: number;
  transition?: {
    type: "none" | "fade" | "slideleft" | "slideright" | "slideup" | "slidedown";
    duration: number; // in seconds, default 1
  };
}

export interface VideoTask {
  id: string;
  url: string;
  status: "idle" | "downloading" | "downloaded" | "exporting" | "completed" | "failed";
  progress: number;
  s3Key?: string;
  presignedUrl?: string;
  metadata?: {
    duration: number; // in seconds
    width: number;
    height: number;
  };
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}
