import React from 'react';
import { Flex, Box, Button, Text, useTheme } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { SistemaLogoColour } from '../components/SistemaLogoColour';
import MiniCalendar from './MiniCalendar';

interface CalendarSidebarProps {
  onDateSelect: (date: Date) => void;
  onDeclareAbsenceClick: () => void;
  selectDate: Date | null;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  onDateSelect,
  onDeclareAbsenceClick,
  selectDate,
}) => {
  const theme = useTheme();

  return (
    <Flex
      width="280px"
      padding={theme.space[4]}
      flexDirection="column"
      gap={theme.space[4]}
      alignItems="center"
    >
      <Box width="150px">
        <SistemaLogoColour />
      </Box>
      <Button
        paddingX="40px"
        variant="outline"
        borderColor={theme.colors.neutralGray[300]}
        size="lg"
        onClick={onDeclareAbsenceClick}
        leftIcon={<AddIcon color="blue.500" />}
      >
        Declare Absence
      </Button>
      <MiniCalendar
        initialDate={new Date()}
        onDateSelect={onDateSelect}
        selectDate={selectDate}
      />
    </Flex>
  );
};

export default CalendarSidebar;
