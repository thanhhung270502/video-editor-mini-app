import { useState, useEffect } from "react";
import { Button, Typography } from "@/shared/components";

interface VideoTimelineProps {
  duration: number; // in seconds
  currentTime: number;
  onAddClip: (start: number, end: number) => void;
  onSeek: (time: number) => void;
}

export function VideoTimeline({ duration, currentTime, onAddClip, onSeek }: VideoTimelineProps) {
  const [start, setStart] = useState<number>(0);
  const [end, setEnd] = useState<number>(Math.min(10, duration));

  // Reset values if duration changes
  useEffect(() => {
    setStart(0);
    setEnd(Math.min(10, duration));
  }, [duration]);

  const handleAdd = () => {
    if (start >= end) return;
    onAddClip(start, end);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m}:${s.toString().padStart(2, "0")}.${ms}`;
  };

  return (
    <div className="rounded-lg border border-white/10 bg-brand-primary-dark/30 p-4">
      <div className="mb-4 flex items-center justify-between">
        <Typography variant="h5" color="primary">
          Select Video Segment
        </Typography>
        <Typography variant="small" color="muted" className="font-mono">
          Current: {formatTime(currentTime)} / {formatTime(duration)}
        </Typography>
      </div>

      {/* Visual Timeline Bar */}
      <div className="relative mb-6 h-6 w-full rounded bg-white/5 border border-white/10">
        {/* Selection Area */}
        <div
          className="absolute h-full bg-brand-primary/30 border-l border-r border-brand-primary"
          style={{
            left: `${(start / duration) * 100}%`,
            width: `${((end - start) / duration) * 100}%`,
          }}
        />
        {/* Playback Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-accent z-10"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        />
      </div>

      {/* Sliders and Range Inputs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <Typography variant="small" color="muted">
              Start Position: <span className="font-mono text-white">{formatTime(start)}</span>
            </Typography>
            <Button
              variant="ghost"
              size="sm"
              className="py-1 px-2 text-xs"
              onClick={() => {
                setStart(currentTime);
                onSeek(currentTime);
              }}
            >
              Use Current Playhead
            </Button>
          </div>
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={start}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setStart(Math.min(val, end - 0.1));
            }}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-brand-primary"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <Typography variant="small" color="muted">
              End Position: <span className="font-mono text-white">{formatTime(end)}</span>
            </Typography>
            <Button
              variant="ghost"
              size="sm"
              className="py-1 px-2 text-xs"
              onClick={() => {
                setEnd(currentTime);
                onSeek(currentTime);
              }}
            >
              Use Current Playhead
            </Button>
          </div>
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={end}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setEnd(Math.max(val, start + 0.1));
            }}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-brand-primary"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSeek(start);
            }}
          >
            Preview Start
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSeek(end);
            }}
          >
            Preview End
          </Button>
        </div>
        <Button
          variant="primary"
          size="sm"
          disabled={start >= end}
          onClick={handleAdd}
        >
          Add Clip Segment
        </Button>
      </div>
    </div>
  );
}
