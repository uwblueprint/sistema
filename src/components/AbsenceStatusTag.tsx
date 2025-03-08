import { useState, useEffect, useRef } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { FiCheckCircle, FiClock } from 'react-icons/fi';

interface AbsenceStatusTagProps {
  absentTeacher: {
    id: number;
    firstName: string;
    lastName: string;
  };
  userId?: number;
  substituteTeacher?: {
    id: number;
    firstName: string;
    lastName: string;
  } | null;
  substituteTeacherFullName?: string;
}

const AbsenceStatusTag = ({
  absentTeacher,
  userId,
  substituteTeacher,
  substituteTeacherFullName,
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
  }, [substituteTeacherFullName]);

  let tagText, tagColor, tagBg, tagIcon;

  if (substituteTeacher && userId === substituteTeacher.id) {
    tagText = `Filled by Me`;
    tagColor = '#2D4F12';
    tagBg = '#D8F5C1';
    tagIcon = <FiCheckCircle size="20px" />;
  } else if (substituteTeacher) {
    tagText = `Filled by ${substituteTeacherFullName}`;
    tagColor = '#2D4F12';
    tagBg = '#D8F5C1';
    tagIcon = <FiCheckCircle size="20px" />;
  } else if (userId === absentTeacher.id) {
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
