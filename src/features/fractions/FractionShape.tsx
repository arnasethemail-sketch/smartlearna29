import type { CSSProperties, KeyboardEvent } from "react";
import {
  getFractionPartCount,
  getFractionGridDimensions,
  type FractionQuestion,
} from "./fractionsEngine";

type FractionShapeProps = {
  question: FractionQuestion;
  selectedParts: number[];
  disabled: boolean;
  onTogglePart: (partIndex: number) => void;
};

const SHAPE_LABELS: Record<FractionQuestion["shape"], string> = {
  "horizontal-bar": "Horizontal fraction bar",
  "vertical-bar": "Vertical fraction bar",
  grid: "Fraction grid",
  circle: "Fraction circle",
};

function getCirclePoint(angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: 150 + 120 * Math.cos(angleInRadians),
    y: 150 + 120 * Math.sin(angleInRadians),
  };
}

function getCircleSegmentPath(partIndex: number, totalParts: number) {
  const startAngle = (partIndex * 360) / totalParts;
  const endAngle = ((partIndex + 1) * 360) / totalParts;
  const start = getCirclePoint(startAngle);
  const end = getCirclePoint(endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return [
    "M 150 150",
    `L ${start.x} ${start.y}`,
    `A 120 120 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

export function FractionShape({
  question,
  selectedParts,
  disabled,
  onTogglePart,
}: FractionShapeProps) {
  const totalParts = getFractionPartCount(question);
  const parts = Array.from(
    { length: totalParts },
    (_, index) => index,
  );
  const isSelected = (partIndex: number) =>
    selectedParts.includes(partIndex);
  const partLabel = (partIndex: number) =>
    `Part ${partIndex + 1} of ${totalParts}`;

  if (question.shape === "circle") {
    return (
      <svg
        viewBox="0 0 300 300"
        className="mx-auto h-auto w-full max-w-[310px] drop-shadow-[0_10px_0_rgba(33,35,44,0.10)]"
        role="group"
        aria-label={SHAPE_LABELS[question.shape]}
      >
        {parts.map((partIndex) => (
          <g
            key={partIndex}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label={partLabel(partIndex)}
            aria-pressed={isSelected(partIndex)}
            aria-disabled={disabled}
            className={disabled ? "cursor-default" : "cursor-pointer"}
            onClick={() => {
              if (!disabled) {
                onTogglePart(partIndex);
              }
            }}
            onKeyDown={(event: KeyboardEvent<SVGGElement>) => {
              if (
                !disabled &&
                (event.key === "Enter" || event.key === " ")
              ) {
                event.preventDefault();
                onTogglePart(partIndex);
              }
            }}
          >
            <path
              d={getCircleSegmentPath(partIndex, totalParts)}
              fill={isSelected(partIndex) ? "#a980f3" : "#ffffff"}
              stroke="#25272b"
              strokeWidth="4"
              className="transition-colors duration-150 group-focus:stroke-[#4f6df5]"
            />
          </g>
        ))}
      </svg>
    );
  }

  const gridDimensions = getFractionGridDimensions(totalParts);
  const isHorizontal = question.shape === "horizontal-bar";
  const isVertical = question.shape === "vertical-bar";
  const gridStyle: CSSProperties = {
    gridTemplateColumns: isVertical
      ? "1fr"
      : `repeat(${
          question.shape === "grid"
            ? gridDimensions.columns
            : totalParts
        }, minmax(0, 1fr))`,
    gridTemplateRows: isHorizontal
      ? "1fr"
      : `repeat(${
          question.shape === "grid"
            ? gridDimensions.rows
            : totalParts
        }, minmax(0, 1fr))`,
  };

  return (
    <div
      role="group"
      aria-label={SHAPE_LABELS[question.shape]}
      className={`mx-auto grid overflow-hidden rounded-lg border-4 border-[#25272b] bg-[#25272b] shadow-[0_10px_0_rgba(33,35,44,0.10)] ${
        isHorizontal
          ? "h-32 w-full max-w-xl gap-x-0.5"
          : isVertical
            ? "h-80 w-52 gap-y-0.5"
            : "aspect-square w-full max-w-[440px] gap-0.5"
      }`}
      style={gridStyle}
    >
      {parts.map((partIndex) => (
        <button
          key={partIndex}
          type="button"
          aria-label={partLabel(partIndex)}
          aria-pressed={isSelected(partIndex)}
          disabled={disabled}
          onClick={() => onTogglePart(partIndex)}
          className={`min-h-0 min-w-0 transition duration-150 focus-visible:relative focus-visible:z-10 focus-visible:outline focus-visible:outline-4 focus-visible:outline-inset focus-visible:outline-[#4f6df5] ${
            isSelected(partIndex)
              ? "bg-[#a980f3] hover:bg-[#966ee0]"
              : "bg-white hover:bg-[#f5f0ff]"
          } disabled:cursor-default`}
        />
      ))}
    </div>
  );
}
