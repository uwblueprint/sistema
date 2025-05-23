import { Box } from '@chakra-ui/react';
import { LessonPlanFile } from '@utils/types';
import { useEffect, useRef, useState } from 'react';
import { FiPaperclip } from 'react-icons/fi';

interface AbsenceBoxProps {
  title: string;
  abbreviation: string;
  location: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  highlightText?: string;
  highlightColor?: string;
  lessonPlan?: LessonPlanFile;
  opacity: number;
  isSelected: boolean;
}

const AbsenceBox: React.FC<AbsenceBoxProps> = ({
  title,
  abbreviation,
  location,
  backgroundColor,
  borderColor,
  textColor,
  highlightText,
  highlightColor,
  lessonPlan,
  opacity,
  isSelected,
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
  }, [highlightText]);

  return (
    <Box
      cursor="pointer"
      sx={{
        padding: '2px 3px 4px 3px',
        paddingRight: lessonPlan ? '28px' : '3px',
        borderRadius: (theme) => `${theme.radii.md}`,
        backgroundColor,
        textColor,
        border: '1px solid',
        borderLeft: '7px solid',
        borderColor,
        position: 'relative',
        opacity,
        maxWidth: '100%',
        boxShadow: isSelected ? '0px 0px 15px 6px rgba(0, 0, 0, 0.10)' : 'none',
        transition: 'box-shadow 0.3s ease',
      }}
    >
      {lessonPlan && (
        <FiPaperclip
          style={{
            position: 'absolute',
            inset: '0 0 auto auto',
            margin: '0.5rem',
            color: textColor,
            transform: 'rotate(180deg)',
          }}
          size={14}
        />
      )}
      <Box className="fc-event-title-container">
        <Box
          className="fc-event-title fc-sticky"
          sx={{
            textStyle: 'h3',
            color: 'inherit',
            fontSize: '16px !important',
          }}
        >
          {title.length > 9 ? abbreviation : title}
        </Box>
      </Box>
      <Box
        className="fc-event-title fc-sticky"
        sx={{
          textStyle: 'subtitle',
          color: 'inherit',
          fontSize: '13px !important',
        }}
      >
        {location}
      </Box>
      {highlightText && (
        <Box
          sx={{
            width: 'fit-content',
            padding: (theme) => `${theme.space[1]} ${theme.space[1]}`,
            borderRadius: (theme) => `${theme.radii.md}`,
            backgroundColor: highlightColor,
            fontWeight: 'bold',
            fontSize: 'xs',
            display: 'flex',
            alignItems: 'center',
            maxWidth: isHovered ? 'none' : '100%',
            transition: 'max-width 1s ease-in-out',
          }}
        >
          <Box
            ref={textRef}
            sx={{
              fontWeight: 'bold',
              fontSize: 'xs',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              maskImage:
                isOverflowing && !isHovered
                  ? 'linear-gradient(to right, black 90%, transparent)'
                  : 'none',
              WebkitMaskImage:
                isOverflowing && !isHovered
                  ? 'linear-gradient(to right, black 90%, transparent)'
                  : 'none',
              transition: 'max-width 1s ease-in-out',
              maxWidth: isHovered ? 'none' : '100%',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {highlightText}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AbsenceBox;
