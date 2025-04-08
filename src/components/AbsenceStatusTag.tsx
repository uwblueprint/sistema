import { Box, Flex, Tooltip, useTheme } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';

interface AbsenceStatusTagProps {
  isUserAbsentTeacher: boolean;
  isUserSubstituteTeacher: boolean;
  isAdminMode: boolean;
  substituteTeacherFullName?: string;
  hasConflictingEvent?: boolean;
}

const AbsenceStatusTag = ({
  isUserAbsentTeacher,
  isUserSubstituteTeacher,
  isAdminMode,
  substituteTeacherFullName,
  hasConflictingEvent,
}: AbsenceStatusTagProps) => {
  const theme = useTheme();
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
    tagColor = theme.colors.positiveGreen[300];
    tagBg = theme.colors.positiveGreen[100];
    tagIcon = <FiCheckCircle size="20px" color={tagColor} />;
  } else if (substituteTeacherFullName) {
    tagText = `Filled by ${substituteTeacherFullName}`;
    tagColor = theme.colors.positiveGreen[300];
    tagBg = theme.colors.positiveGreen[100];
    tagIcon = <FiCheckCircle size="20px" color={tagColor} />;
  } else if (isUserAbsentTeacher) {
    tagText = 'Unfilled';
    tagColor = theme.colors.warningOrange[300];
    tagBg = theme.colors.warningOrange[100];
    tagIcon = <FiClock size="20px" color={tagColor} />;
  } else {
    tagText = 'Open to fill';
    tagColor = theme.colors.primaryBlue[400];
    tagBg = theme.colors.primaryBlue[50];
    tagIcon = <FiClock size="20px" color={tagColor} />;
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
      zIndex={isHovered ? 10 : 'auto'}
    >
      <Flex gap="7px" align="center">
        {tagIcon}
        <Box
          ref={textRef}
          fontWeight={theme.textStyles.label.fontWeight}
          fontSize={theme.textStyles.label.fontSize}
          whiteSpace="nowrap"
          overflow="hidden"
          maxWidth={isHovered ? 'none' : isAdminMode ? '150px' : '210px'}
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
        {hasConflictingEvent &&
          !substituteTeacherFullName &&
          !isUserAbsentTeacher && (
            <Tooltip
              label="You have already filled for an absence on this date"
              placement="right"
            >
              <Box as="span">
                <FiAlertCircle
                  size="16px"
                  color={theme.colors.warningOrange[300]}
                />
              </Box>
            </Tooltip>
          )}
      </Flex>
    </Box>
  );
};

export default AbsenceStatusTag;
