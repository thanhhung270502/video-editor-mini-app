import { Typography, Button } from "@/shared/components";
import { ClipSelection } from "../pages/video-editor.page";

interface ClipListProps {
  clips: ClipSelection[];
  onRemoveClip: (index: number) => void;
  onUpdateTransition: (index: number, type: ClipSelection["transition"]["type"], duration: number) => void;
  onReorder: (index: number, direction: "up" | "down") => void;
  onSeekToClip: (start: number) => void;
}

export function ClipList({
  clips,
  onRemoveClip,
  onUpdateTransition,
  onReorder,
  onSeekToClip,
}: ClipListProps) {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m}:${s.toString().padStart(2, "0")}.${ms}`;
  };

  if (clips.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-white/10 bg-brand-primary-dark/20 p-6 text-center">
        <Typography variant="body" color="muted" className="mb-2">
          No segments added yet
        </Typography>
        <Typography variant="caption" color="muted">
          Use the timeline selector above to select sections and click "Add Clip Segment".
        </Typography>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Typography variant="h5" color="primary">
          Selected Segments ({clips.length})
        </Typography>
        <Typography variant="caption" color="muted">
          Videos will be merged in the order below
        </Typography>
      </div>

      <div className="flex flex-col gap-3">
        {clips.map((clip, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === clips.length - 1;

          return (
            <div
              key={idx}
              className="flex flex-col gap-3 rounded-lg border border-white/10 bg-brand-primary-dark/30 p-4 transition-all hover:border-white/20"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">
                    {idx + 1}
                  </div>
                  <div>
                    <Typography variant="body" className="font-medium">
                      Clip Segment
                    </Typography>
                    <Typography variant="caption" color="muted" className="font-mono">
                      {formatTime(clip.start)} ➜ {formatTime(clip.end)} (Duration:{" "}
                      {(clip.end - clip.start).toFixed(1)}s)
                    </Typography>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 p-2"
                    onClick={() => onSeekToClip(clip.start)}
                    title="Seek to start"
                  >
                    ▶ Preview
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={isFirst}
                    onClick={() => onReorder(idx, "up")}
                    title="Move Up"
                  >
                    ▲
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={isLast}
                    onClick={() => onReorder(idx, "down")}
                    title="Move Down"
                  >
                    ▼
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="h-8 text-xs hover:bg-error-alt/80 hover:text-white"
                    onClick={() => onRemoveClip(idx)}
                  >
                    Delete
                  </Button>
                </div>
              </div>

              {/* Transition Settings (applicable to all boundary cuts except the last block) */}
              {!isLast && (
                <div className="mt-2 border-t border-white/5 pt-3">
                  <div className="flex flex-wrap items-center gap-4">
                    <Typography variant="small" color="muted" className="flex items-center gap-1.5">
                      ⛓ Transition to Clip {idx + 2}:
                    </Typography>
                    <div className="flex items-center gap-2">
                      <select
                        value={clip.transition?.type || "none"}
                        onChange={(e) =>
                          onUpdateTransition(
                            idx,
                            e.target.value as ClipSelection["transition"]["type"],
                            clip.transition?.duration || 1
                          )
                        }
                        className="rounded border border-white/10 bg-brand-primary-dark px-2 py-1 text-xs text-white outline-none focus:border-brand-primary"
                      >
                        <option value="none">Cut (None)</option>
                        <option value="fade">Fade</option>
                        <option value="slideleft">Slide Left</option>
                        <option value="slideright">Slide Right</option>
                        <option value="slideup">Slide Up</option>
                        <option value="slidedown">Slide Down</option>
                      </select>
                    </div>

                    {(clip.transition?.type || "none") !== "none" && (
                      <div className="flex items-center gap-2">
                        <Typography variant="caption" color="muted">
                          Duration (s):
                        </Typography>
                        <input
                          type="number"
                          min={0.1}
                          max={Math.min(5, clip.end - clip.start, clips[idx + 1].end - clips[idx + 1].start)}
                          step={0.1}
                          value={clip.transition?.duration || 1}
                          onChange={(e) => {
                            let val = parseFloat(e.target.value) || 1;
                            const maxDuration = Math.min(
                              clip.end - clip.start,
                              clips[idx + 1].end - clips[idx + 1].start
                            );
                            if (val > maxDuration) val = maxDuration;
                            onUpdateTransition(idx, clip.transition.type, val);
                          }}
                          className="w-16 rounded border border-white/10 bg-brand-primary-dark px-2 py-0.5 text-xs text-white outline-none focus:border-brand-primary font-mono text-center"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
