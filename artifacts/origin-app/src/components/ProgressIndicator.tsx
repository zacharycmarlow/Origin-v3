/**
 * Chapter progress indicator.
 *
 * Renders seven dots — one per chapter — with the current chapter
 * highlighted in gold (#c89838). Completed chapters are filled;
 * future chapters are dimmed.
 */
interface ProgressIndicatorProps {
  /** Zero-based index of the current chapter (0–6). */
  currentChapter: number;
  /** Zero-based indices of chapters the user has completed. */
  completedChapters: number[];
  /** Total number of chapters (defaults to 7). */
  total?: number;
}

export default function ProgressIndicator({
  currentChapter,
  completedChapters,
  total = 7,
}: ProgressIndicatorProps) {
  const completed = new Set(completedChapters);
  const dots = Array.from({ length: total }, (_, i) => i);

  return (
    <div
      className="progress-indicator"
      role="progressbar"
      aria-valuenow={currentChapter + 1}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label="Chapter progress"
    >
      {dots.map((i) => {
        const isCurrent = i === currentChapter;
        const isComplete = completed.has(i);
        const isPast = i < currentChapter;
        const className = [
          "progress-dot",
          isCurrent ? "progress-dot--current" : "",
          isComplete ? "progress-dot--complete" : "",
          isPast && !isComplete ? "progress-dot--past" : "",
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <span
            key={i}
            className={className}
            aria-hidden="true"
            title={`Chapter ${i + 1}${isComplete ? " · complete" : isCurrent ? " · current" : ""}`}
          />
        );
      })}
    </div>
  );
}
