type ScaleBarIconProps = {
  width: number;
};

export function ScaleBarIcon({ width }: ScaleBarIconProps) {
  const barWidth = Math.max(width, 20);
  const lineEnd = Math.max(width - 2, 18);

  return (
    <svg
      width={barWidth}
      height="20"
      viewBox={`0 0 ${barWidth} 20`}
      style={{ minWidth: '20px' }}
    >
      <line
        x1="2"
        y1="5"
        x2="2"
        y2="15"
        stroke="white"
        strokeWidth="1.5"
      />
      <line
        x1="2"
        y1="10"
        x2={lineEnd}
        y2="10"
        stroke="white"
        strokeWidth="1.5"
      />
      <line
        x1={lineEnd}
        y1="5"
        x2={lineEnd}
        y2="15"
        stroke="white"
        strokeWidth="1.5"
      />
    </svg>
  );
}
