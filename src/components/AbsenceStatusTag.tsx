import { useState, useEffect, useRef } from 'react';
import { Box, Flex, Text, Tooltip } from '@chakra-ui/react';
import { FiCheckCircle, FiClock } from 'react-icons/fi';

const AbsenceStatusTag = ({
  substituteTeacher,
}: {
  substituteTeacher?: string;
}) => {
  const textRef = useRef<HTMLDivElement | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const checkOverflow = () => {
    if (textRef.current) {
      setIsOverflowing(
        textRef.current.scrollWidth > textRef.current.clientWidth
      );
    }
  };

  useEffect(() => {
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [substituteTeacher]);

  return (
    <Box
      sx={{ padding: '5px 12px 5px 10px' }}
      fontSize="12px"
      borderRadius="5px"
      color={substituteTeacher ? '#2D4F12' : '#9B520E'}
      bg={substituteTeacher ? '#D8F5C1' : '#FEEED5'}
      maxWidth="200px"
    >
      <Tooltip
        isDisabled={!substituteTeacher}
        label={`Filled by ${substituteTeacher}`}
        placement="top"
        sx={{
          bg: 'white',
          color: '#0468C1',
          fontSize: '12px',
          borderRadius: '8px',
          padding: '8px',
          boxShadow: 'lg',
        }}
      >
        <Flex gap="7px" align="center">
          {substituteTeacher ? (
            <FiCheckCircle size="20px" />
          ) : (
            <FiClock size="20px" />
          )}

          <Box
            ref={textRef}
            position="relative"
            fontWeight="500"
            fontSize="inherit"
            maxWidth="150px"
            whiteSpace="nowrap"
            overflow="hidden"
            sx={{
              maskImage: isOverflowing
                ? 'linear-gradient(to right, black 80%, transparent)'
                : 'none',
              WebkitMaskImage: isOverflowing
                ? 'linear-gradient(to right, black 80%, transparent)'
                : 'none',
            }}
          >
            {substituteTeacher ? `Filled by ${substituteTeacher}` : 'Unfilled'}
          </Box>
        </Flex>
      </Tooltip>
    </Box>
  );
};

export default AbsenceStatusTag;
