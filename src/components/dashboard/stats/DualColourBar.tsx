interface DualColorBarProps {
  x: number;
  y: number;
  width: number;
  height: number;
  payload: {
    month: string;
    filled: number;
    unfilled: number;
  };
  filledColor: string;
  unfilledColor: string;
  isActive?: boolean;
}

const DualColorBar: React.FC<DualColorBarProps> = ({
  x,
  y,
  width,
  height,
  payload,
  filledColor,
  unfilledColor,
  isActive = false,
}) => {
  if (!payload) return null;

  const total = payload.filled + payload.unfilled;
  if (total === 0 || height <= 0 || width <= 0) return null;

  const filledRatio = payload.filled / total;
  const filledHeight = height * filledRatio;
  const filledY = y + height - filledHeight;

  const r = 2;
  const rY = Math.min(r, height / 2);
  const rX = Math.min(r, width / 2);

  const shadow = isActive ? 'drop-shadow(0px 4px 6px rgba(0,0,0,0.2))' : 'none';

  return (
    <g filter={shadow}>
      <path
        d={`
            M${x},${y + height}
            V${y + rY}
            Q${x},${y} ${x + rX},${y}
            H${x + width - rX}
            Q${x + width},${y} ${x + width},${y + rY}
            V${y + height}
            Z
          `}
        fill={unfilledColor}
      />

      {payload.unfilled === 0 ? (
        <path
          d={`
              M${x},${filledY + filledHeight}
              V${filledY + rY}
              Q${x},${filledY} ${x + rX},${filledY}
              H${x + width - rX}
              Q${x + width},${filledY} ${x + width},${filledY + rY}
              V${filledY + filledHeight}
              Z
            `}
          fill={filledColor}
        />
      ) : (
        <rect
          x={x}
          y={filledY}
          width={width}
          height={filledHeight}
          fill={filledColor}
        />
      )}
    </g>
  );
};

export default DualColorBar;
