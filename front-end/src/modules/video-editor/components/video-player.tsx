import { forwardRef } from "react";
import { Typography } from "@/shared/components";

interface VideoPlayerProps {
  url?: string;
  onTimeUpdate?: (time: number) => void;
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ url, onTimeUpdate }, ref) => {
    if (!url) {
      return (
        <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-white/10 bg-brand-primary-dark/50">
          <Typography variant="body" color="muted">
            No video loaded. Enter a YouTube URL to get started.
          </Typography>
        </div>
      );
    }

    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-white/10 bg-black">
        <video
          ref={ref}
          src={url}
          className="h-full w-full object-contain"
          controls
          onTimeUpdate={(e) => {
            if (onTimeUpdate) {
              onTimeUpdate((e.target as HTMLVideoElement).currentTime);
            }
          }}
        />
      </div>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";
