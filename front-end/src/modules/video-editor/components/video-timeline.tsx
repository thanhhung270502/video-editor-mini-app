import { useState, useEffect, useRef } from "react";
import { Button, Typography } from "@/shared/components";

interface TimelineClip {
  start: number;
  end: number;
}

interface VideoTimelineProps {
  duration: number; // in seconds
  currentTime: number;
  clips?: TimelineClip[];
  onAddClip: (start: number, end: number) => void;
  onSeek: (time: number) => void;
}

export function VideoTimeline({
  duration,
  currentTime,
  clips = [],
  onAddClip,
  onSeek,
}: VideoTimelineProps) {
  const [start, setStart] = useState<number>(0);
  const [end, setEnd] = useState<number>(Math.min(10, duration));
  const trackRef = useRef<HTMLDivElement | null>(null);

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

  // Dragging logic
  const handleStartDrag = (
    e: React.MouseEvent | React.TouchEvent,
    type: "start" | "end" | "middle" | "seek"
  ) => {
    e.preventDefault();
    const isTouch = "touches" in e;
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;

    const initialClientX = clientX;
    const initialStart = start;
    const initialEnd = end;

    const getXTime = (currentX: number) => {
      if (!trackRef.current) return 0;
      const rect = trackRef.current.getBoundingClientRect();
      const percentage = (currentX - rect.left) / rect.width;
      const time = percentage * duration;
      return Math.max(0, Math.min(duration, time));
    };

    if (type === "seek") {
      const clickTime = getXTime(clientX);
      onSeek(clickTime);
    }

    const handleMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
      const moveX = "touches" in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return;

      const deltaX = moveX - initialClientX;
      const deltaTime = (deltaX / rect.width) * duration;

      if (type === "start") {
        const newStart = Math.max(0, Math.min(end - 0.1, initialStart + deltaTime));
        setStart(newStart);
        onSeek(newStart);
      } else if (type === "end") {
        const newEnd = Math.max(start + 0.1, Math.min(duration, initialEnd + deltaTime));
        setEnd(newEnd);
        onSeek(newEnd);
      } else if (type === "middle") {
        const currentDuration = initialEnd - initialStart;
        let newStart = initialStart + deltaTime;
        let newEnd = initialEnd + deltaTime;
        if (newStart < 0) {
          newStart = 0;
          newEnd = currentDuration;
        } else if (newEnd > duration) {
          newEnd = duration;
          newStart = duration - currentDuration;
        }
        setStart(newStart);
        setEnd(newEnd);
      } else if (type === "seek") {
        const clickTime = getXTime(moveX);
        onSeek(clickTime);
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("touchend", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleMouseMove, { passive: true });
    window.addEventListener("touchend", handleMouseUp);
  };

  // Keyboard hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT")
      ) {
        return;
      }

      if (e.key === "[") {
        const newStart = Math.min(currentTime, end - 0.1);
        setStart(newStart);
        onSeek(currentTime);
      } else if (e.key === "]") {
        const newEnd = Math.max(currentTime, start + 0.1);
        setEnd(newEnd);
        onSeek(currentTime);
      } else if (e.key === " ") {
        const video = document.querySelector("video");
        if (video) {
          e.preventDefault();
          if (video.paused) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const step = e.shiftKey ? 1.0 : 0.1;
        const newTime = Math.max(0, currentTime - step);
        onSeek(newTime);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const step = e.shiftKey ? 1.0 : 0.1;
        const newTime = Math.min(duration, currentTime + step);
        onSeek(newTime);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentTime, duration, start, end, onSeek]);

  // Generate tick marks
  const numTicks = 8;
  const ticks = [];
  for (let i = 0; i <= numTicks; i++) {
    ticks.push((i / numTicks) * duration);
  }

  return (
    <div className="bg-brand-primary-dark/30 rounded-lg border border-white/10 p-5">
      {/* Header Info */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Typography variant="h5" color="primary">
            Select Video Segment
          </Typography>
          <Typography variant="caption" color="muted" className="mt-1 block">
            Drag the yellow handles, drag the segment block, or click the timeline.
          </Typography>
        </div>
        <div className="text-right">
          <Typography variant="small" color="primary" className="font-mono font-bold">
            Current: {formatTime(currentTime)}
          </Typography>
          <Typography variant="caption" color="muted" className="block font-mono">
            Total: {formatTime(duration)}
          </Typography>
        </div>
      </div>

      {/* Keyboard shortcuts cheatsheet */}
      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/40">
        <span>💡 Keyboard Hotkeys:</span>
        <span>
          <kbd className="rounded bg-white/10 px-1 font-mono text-[10px] text-white">Space</kbd>{" "}
          Play/Pause
        </span>
        <span>
          <kbd className="rounded bg-white/10 px-1 font-mono text-[10px] text-white">[</kbd> Mark
          Start
        </span>
        <span>
          <kbd className="rounded bg-white/10 px-1 font-mono text-[10px] text-white">]</kbd> Mark
          End
        </span>
        <span>
          <kbd className="rounded bg-white/10 px-1 font-mono text-[10px] text-white">←</kbd> /{" "}
          <kbd className="rounded bg-white/10 px-1 font-mono text-[10px] text-white">→</kbd> Seek
          0.1s (Shift for 1s)
        </span>
      </div>

      {/* Timeline Container */}
      <div className="relative mb-8 select-none">
        {/* Time Ticks */}
        <div className="relative mb-2 flex justify-between px-1 font-mono text-[10px] text-white/40">
          {ticks.map((t, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span>{formatTime(t)}</span>
              <div className="mt-1 h-1 w-px bg-white/20" />
            </div>
          ))}
        </div>

        {/* Visual Timeline Bar */}
        <div
          ref={trackRef}
          className="relative h-10 w-full cursor-pointer rounded-md border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-white/20"
          onMouseDown={(e) => handleStartDrag(e, "seek")}
          onTouchStart={(e) => handleStartDrag(e, "seek")}
        >
          {/* Grid lines inside track */}
          <div className="pointer-events-none absolute inset-0 flex justify-between">
            {ticks.map((_, idx) => (
              <div key={idx} className="h-full w-px bg-white/3" />
            ))}
          </div>

          {/* Render Existing Clips */}
          {clips.map((clip, idx) => {
            const left = (clip.start / duration) * 100;
            const width = ((clip.end - clip.start) / duration) * 100;
            return (
              <div
                key={idx}
                className="pointer-events-none absolute top-0 bottom-0 border-x border-emerald-500/25 bg-emerald-500/10"
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                }}
                title={`Added Clip Segment ${idx + 1}`}
              />
            );
          })}

          {/* Active Selection Area */}
          <div
            className="border-brand-primary bg-brand-primary/20 hover:bg-brand-primary/25 active:bg-brand-primary/30 absolute top-0 bottom-0 cursor-move border-y-2 transition-colors"
            style={{
              left: `${(start / duration) * 100}%`,
              width: `${((end - start) / duration) * 100}%`,
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              handleStartDrag(e, "middle");
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              handleStartDrag(e, "middle");
            }}
          />

          {/* Left Handle (Start Position) */}
          <div
            className="group bg-brand-primary active:bg-brand-primary-light absolute top-[-2px] bottom-[-2px] z-20 ml-[-7px] flex w-3.5 cursor-ew-resize items-center justify-center rounded border border-white/30 shadow-[0_2px_8px_rgba(0,0,0,0.5)] transition-transform hover:scale-y-105"
            style={{ left: `${(start / duration) * 100}%` }}
            onMouseDown={(e) => {
              e.stopPropagation();
              handleStartDrag(e, "start");
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              handleStartDrag(e, "start");
            }}
          >
            {/* Tooltip */}
            <div className="bg-brand-primary-dark/95 absolute bottom-full mb-2 hidden rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] whitespace-nowrap text-white shadow-lg group-hover:block">
              Start: {formatTime(start)}
            </div>
            {/* Grip pattern */}
            <div className="flex flex-col gap-0.5">
              <div className="h-3 w-px bg-white/60" />
              <div className="h-3 w-px bg-white/60" />
            </div>
          </div>

          {/* Right Handle (End Position) */}
          <div
            className="group bg-brand-primary active:bg-brand-primary-light absolute top-[-2px] bottom-[-2px] z-20 ml-[-7px] flex w-3.5 cursor-ew-resize items-center justify-center rounded border border-white/30 shadow-[0_2px_8px_rgba(0,0,0,0.5)] transition-transform hover:scale-y-105"
            style={{ left: `${(end / duration) * 100}%` }}
            onMouseDown={(e) => {
              e.stopPropagation();
              handleStartDrag(e, "end");
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              handleStartDrag(e, "end");
            }}
          >
            {/* Tooltip */}
            <div className="bg-brand-primary-dark/95 absolute bottom-full mb-2 hidden rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] whitespace-nowrap text-white shadow-lg group-hover:block">
              End: {formatTime(end)}
            </div>
            {/* Grip pattern */}
            <div className="flex flex-col gap-0.5">
              <div className="h-3 w-px bg-white/60" />
              <div className="h-3 w-px bg-white/60" />
            </div>
          </div>

          {/* Playhead */}
          <div
            className="pointer-events-none absolute top-[-6px] bottom-[-6px] z-30 w-[2px] bg-rose-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          >
            {/* Playhead Indicator Circle */}
            <div className="absolute -top-1 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-white bg-rose-500 shadow-md" />
          </div>
        </div>
      </div>

      {/* Fine-Tuning Inputs & Nudge Controls */}
      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Start Position Controls */}
        <div className="flex flex-col gap-2 rounded-lg border border-white/5 bg-white/2 p-3 transition-colors hover:bg-white/4">
          <div className="flex items-center justify-between">
            <Typography variant="small" color="muted" className="font-semibold">
              Start Position
            </Typography>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 py-0 text-[11px]"
              onClick={() => {
                setStart(currentTime);
                onSeek(currentTime);
              }}
            >
              Use Current Playhead
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step={0.1}
              min={0}
              max={end - 0.1}
              value={parseFloat(start.toFixed(2))}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                const clamped = Math.max(0, Math.min(end - 0.1, val));
                setStart(clamped);
                onSeek(clamped);
              }}
              className="bg-brand-primary-dark/60 focus:border-brand-primary w-24 rounded border border-white/10 px-2 py-1 text-center font-mono text-sm text-white outline-none"
            />
            <div className="flex flex-1 justify-end gap-1">
              <button
                onClick={() => {
                  const val = Math.max(0, start - 1.0);
                  setStart(val);
                  onSeek(val);
                }}
                className="rounded bg-white/5 px-2 py-1 font-mono text-xs text-white/80 transition-colors hover:bg-white/15 active:scale-95"
                title="Subtract 1 second"
              >
                -1s
              </button>
              <button
                onClick={() => {
                  const val = Math.max(0, start - 0.1);
                  setStart(val);
                  onSeek(val);
                }}
                className="rounded bg-white/5 px-2 py-1 font-mono text-xs text-white/80 transition-colors hover:bg-white/15 active:scale-95"
                title="Subtract 0.1 seconds"
              >
                -0.1s
              </button>
              <button
                onClick={() => {
                  const val = Math.min(end - 0.1, start + 0.1);
                  setStart(val);
                  onSeek(val);
                }}
                className="rounded bg-white/5 px-2 py-1 font-mono text-xs text-white/80 transition-colors hover:bg-white/15 active:scale-95"
                title="Add 0.1 seconds"
              >
                +0.1s
              </button>
              <button
                onClick={() => {
                  const val = Math.min(end - 0.1, start + 1.0);
                  setStart(val);
                  onSeek(val);
                }}
                className="rounded bg-white/5 px-2 py-1 font-mono text-xs text-white/80 transition-colors hover:bg-white/15 active:scale-95"
                title="Add 1 second"
              >
                +1s
              </button>
            </div>
          </div>
        </div>

        {/* End Position Controls */}
        <div className="flex flex-col gap-2 rounded-lg border border-white/5 bg-white/2 p-3 transition-colors hover:bg-white/4">
          <div className="flex items-center justify-between">
            <Typography variant="small" color="muted" className="font-semibold">
              End Position
            </Typography>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 py-0 text-[11px]"
              onClick={() => {
                setEnd(currentTime);
                onSeek(currentTime);
              }}
            >
              Use Current Playhead
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step={0.1}
              min={start + 0.1}
              max={duration}
              value={parseFloat(end.toFixed(2))}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || duration;
                const clamped = Math.max(start + 0.1, Math.min(duration, val));
                setEnd(clamped);
                onSeek(clamped);
              }}
              className="bg-brand-primary-dark/60 focus:border-brand-primary w-24 rounded border border-white/10 px-2 py-1 text-center font-mono text-sm text-white outline-none"
            />
            <div className="flex flex-1 justify-end gap-1">
              <button
                onClick={() => {
                  const val = Math.max(start + 0.1, end - 1.0);
                  setEnd(val);
                  onSeek(val);
                }}
                className="rounded bg-white/5 px-2 py-1 font-mono text-xs text-white/80 transition-colors hover:bg-white/15 active:scale-95"
                title="Subtract 1 second"
              >
                -1s
              </button>
              <button
                onClick={() => {
                  const val = Math.max(start + 0.1, end - 0.1);
                  setEnd(val);
                  onSeek(val);
                }}
                className="rounded bg-white/5 px-2 py-1 font-mono text-xs text-white/80 transition-colors hover:bg-white/15 active:scale-95"
                title="Subtract 0.1 seconds"
              >
                -0.1s
              </button>
              <button
                onClick={() => {
                  const val = Math.min(duration, end + 0.1);
                  setEnd(val);
                  onSeek(val);
                }}
                className="rounded bg-white/5 px-2 py-1 font-mono text-xs text-white/80 transition-colors hover:bg-white/15 active:scale-95"
                title="Add 0.1 seconds"
              >
                +0.1s
              </button>
              <button
                onClick={() => {
                  const val = Math.min(duration, end + 1.0);
                  setEnd(val);
                  onSeek(val);
                }}
                className="rounded bg-white/5 px-2 py-1 font-mono text-xs text-white/80 transition-colors hover:bg-white/15 active:scale-95"
                title="Add 1 second"
              >
                +1s
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
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
          className="shadow-md"
        >
          Add Clip Segment
        </Button>
      </div>
    </div>
  );
}
