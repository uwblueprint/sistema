import { useState, useEffect, useRef } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { FiCheckCircle, FiClock } from 'react-icons/fi';

const AbsenceStatusTag = ({
  substituteTeacher,
}: {
  substituteTeacher?: string;
}) => {
  const textRef = useRef<HTMLDivElement | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
      maxWidth={isHovered ? 'fit-content' : '200px'}
      transition="max-width 0.3s ease-in-out"
      zIndex={isHovered ? 10 : 'auto'} // overlay on top of buttons
      display="flex"
      alignItems="center"
      sx={{
        padding: '5px 12px 5px 10px',
        fontSize: '12px',
        borderRadius: '5px',
        color: substituteTeacher ? '#2D4F12' : '#9B520E',
        bg: substituteTeacher ? '#D8F5C1' : '#FEEED5',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Flex gap="7px" align="center">
        {substituteTeacher ? (
          <FiCheckCircle size="16px" />
        ) : (
          <FiClock size="16px" />
        )}

        <Box
          ref={textRef}
          fontWeight="500"
          fontSize="12px"
          whiteSpace="nowrap"
          overflow="hidden"
          maxWidth={isHovered ? 'none' : '150px'}
          sx={{
            maskImage:
              isOverflowing && !isHovered
                ? 'linear-gradient(to right, black 90%, transparent)'
                : 'none',
            WebkitMaskImage:
              isOverflowing && !isHovered
                ? 'linear-gradient(to right, black 90%, transparent)'
                : 'none',
          }}
        >
          {substituteTeacher ? `Filled by ${substituteTeacher}` : 'Unfilled'}
        </Box>
      </Flex>
    </Box>
  );
};

export default AbsenceStatusTag;
