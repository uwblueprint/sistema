import { Box, Button, Flex } from '@chakra-ui/react';

interface CalendarTabsProps {
  activeTab: 'explore' | 'declared';
  onTabChange: (tab: 'explore' | 'declared') => void;
}

export function CalendarTabs({ activeTab, onTabChange }: CalendarTabsProps) {
  return (
    <Flex
      position="relative"
      width="100%"
      justify="space-between"
      align="center"
    >
      <Button
        variant="unstyled"
        fontSize="16px"
        fontWeight="600"
        width="50%"
        color={activeTab === 'explore' ? 'primaryBlue.300' : 'text.subtitle'}
        onClick={() => onTabChange('explore')}
        pb="8px"
        _hover={{ color: 'primaryBlue.300' }}
        _active={{ bg: 'transparent' }}
        borderRadius={0}
      >
        Explore Fillable Absences
      </Button>

      <Button
        variant="unstyled"
        fontSize="16px"
        fontWeight="600"
        width="50%"
        color={activeTab === 'declared' ? 'primaryBlue.300' : 'text.subtitle'}
        onClick={() => onTabChange('declared')}
        pb="8px"
        _hover={{ color: 'primaryBlue.300' }}
        _active={{ bg: 'transparent' }}
        borderRadius={0}
      >
        My Declared & Filled Absences
      </Button>

      <Box
        position="absolute"
        bottom="0"
        left="0"
        width="50%"
        height="2px"
        bg="primaryBlue.300"
        transition="transform 0.3s ease"
        transform={
          activeTab === 'explore' ? 'translateX(0%)' : 'translateX(100%)'
        }
      />
    </Flex>
  );
}
