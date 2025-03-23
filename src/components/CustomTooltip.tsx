import { Box } from '@chakra-ui/react';
import { type TooltipProps } from 'recharts';

export const CustomTooltip = ({
  active,
  payload,
  coordinate,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const filled =
      payload.find((entry) => entry.dataKey === 'filled')?.value || 0;
    const unfilled =
      payload.find((entry) => entry.dataKey === 'unfilled')?.value || 0;
    const total = filled + unfilled;

    if (total === 0) {
      return null;
    }

    return (
      <Box
        position="absolute"
        left={`${coordinate?.x}px`}
        width="60px"
        transform="translateX(-50%) translateY(-80%)"
        bg="primaryBlue.300"
        color="white"
        px="8px"
        py="4px"
        borderRadius="md"
        fontSize="14px"
        fontWeight="300"
        textAlign="center"
        zIndex={1}
        _after={{
          content: '""',
          position: 'absolute',
          bottom: '-5px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid #0468C1',
        }}
      >
        {filled}/{total}
      </Box>
    );
  }
  return null;
};
