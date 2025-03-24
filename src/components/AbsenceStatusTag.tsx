import { useState, useEffect, useRef } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { FiCheckCircle, FiClock } from 'react-icons/fi';

interface AbsenceStatusTagProps {
  isUserAbsentTeacher: boolean;
  isUserSubstituteTeacher: boolean;
  isUserAdmin: boolean;
  substituteTeacherFullName?: string;
}

const AbsenceStatusTag = ({
  isUserAbsentTeacher,
  isUserSubstituteTeacher,
  isUserAdmin,
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

  if (substituteTeacherFullName && isUserSubstituteTeacher) {
    tagText = `Filled by Me`;
    tagColor = '#2D4F12';
    tagBg = '#D8F5C1';
    tagIcon = <FiCheckCircle size="20px" />;
  } else if (substituteTeacherFullName) {
    tagText = `Filled by ${substituteTeacherFullName}`;
    tagColor = '#2D4F12';
    tagBg = '#D8F5C1';
    tagIcon = <FiCheckCircle size="20px" />;
  } else if (isUserAbsentTeacher) {
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
      zIndex={isHovered ? 10 : 'auto'} // overlay on top of buttons
    >
      <Flex gap="7px" align="center">
        {tagIcon}
        <Box
          ref={textRef}
          fontWeight="500"
          fontSize="12px"
          whiteSpace="nowrap"
          overflow="hidden"
          maxWidth={isHovered ? 'none' : isUserAdmin ? '150px' : '210px'}
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
