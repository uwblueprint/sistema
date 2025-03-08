import { useState, useEffect, useRef } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { FiCheckCircle, FiClock } from 'react-icons/fi';

interface AbsenceStatusTagProps {
  absentTeacherId: number;
  userId?: number;
  substituteTeacher?: string;
  substituteTeacherId?: number;
}

const AbsenceStatusTag = ({
  absentTeacherId,
  userId,
  substituteTeacher,
  substituteTeacherId,
}: AbsenceStatusTagProps) => {
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

  let tagText, tagColor, tagBg, tagIcon;

  if (substituteTeacher && userId === substituteTeacherId) {
    tagText = `Filled by Me`;
    tagColor = '#2D4F12';
    tagBg = '#D8F5C1';
    tagIcon = <FiCheckCircle size="20px" />;
  } else if (substituteTeacher) {
    tagText = `Filled by ${substituteTeacher}`;
    tagColor = '#2D4F12';
    tagBg = '#D8F5C1';
    tagIcon = <FiCheckCircle size="20px" />;
  } else if (userId === absentTeacherId) {
    tagText = 'Unfilled';
    tagColor = '#9B520E';
    tagBg = '#FEEED5';
    tagIcon = <FiClock size="20px" />;
  } else {
    tagText = 'Open to fill';
    tagColor = '#2248AF';
    tagBg = '#E4F3FF';
    tagIcon = <FiClock size="20px" />;
  }

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
        color: tagColor,
        bg: tagBg,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Flex gap="7px" align="center">
        {tagIcon}
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
          {tagText}
        </Box>
      </Flex>
    </Box>
  );
};

export default AbsenceStatusTag;
