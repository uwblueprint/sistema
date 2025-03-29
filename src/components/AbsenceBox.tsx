import { Box, useTheme } from '@chakra-ui/react';
import { FiPaperclip } from 'react-icons/fi';
import { useEffect, useRef, useState } from 'react';

interface AbsenceBoxProps {
  title: string;
  location: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  highlightText?: string;
  highlightColor?: string;
  lessonPlan?: string;
  opacity: number;
}

const AbsenceBox: React.FC<AbsenceBoxProps> = ({
  title,
  location,
  backgroundColor,
  borderColor,
  textColor,
  highlightText,
  highlightColor,
  lessonPlan,
  opacity,
}) => {
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
  }, [highlightText]);

  return (
    <Box
      sx={{
        padding: (theme) => `${theme.space[1]} ${theme.space[1]}`,
        margin: (theme) => `${theme.space[2]} 0`,
        borderRadius: (theme) => `${theme.radii.md}`,
        backgroundColor,
        textColor,
        border: '0.1rem solid',
        borderLeft: '5px solid',
        borderColor,
        position: 'relative',
        opacity,
        maxWidth: '100%',
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
        />
      )}
      <Box className="fc-event-title-container">
        <Box className="fc-event-title fc-sticky" sx={{ fontWeight: 'bold' }}>
          {title}
        </Box>
      </Box>
      <Box className="fc-event-title fc-sticky" sx={{ fontSize: 'xs' }}>
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
