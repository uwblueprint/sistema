import { Box } from '@chakra-ui/react';
import { motion } from 'framer-motion';

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  filledColor: string;
  unfilledColor: string;
  animate?: boolean;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 110,
  strokeWidth = 22,
  filledColor,
  unfilledColor,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;

  return (
    <Box
      position="relative"
      width={`${size}px`}
      height={`${size}px`}
      display="inline-block"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'scale(-1, 1)' }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={unfilledColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={filledColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="butt"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />
      </svg>
    </Box>
  );
};

export default CircularProgress;
