import { Box, useTheme } from '@chakra-ui/react';
import { type TooltipProps } from 'recharts';

export const CustomTooltip = ({
  active,
  payload,
  coordinate,
}: TooltipProps<number, string>) => {
  const theme = useTheme();
  const primaryBlue = theme.colors.primaryBlue[300];
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;

    const filled = data?.filled ?? 0;
    const unfilled = data?.unfilled ?? 0;
    const total = filled + unfilled;

    if (total === 0) return null;

    return (
      <Box
        position="absolute"
        left={`${coordinate?.x}px`}
        transform="translateX(-50%) translateY(-80%)"
        bg={primaryBlue}
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
          borderTop: `6px solid ${primaryBlue}`,
        }}
      >
        {filled}/{total}
      </Box>
    );
  }
  return null;
};
