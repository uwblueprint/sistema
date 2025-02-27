'use client';

import * as React from 'react';
import { Box, Button, Flex } from '@chakra-ui/react';

interface CalendarTabsProps {
  activeTab: 'explore' | 'declared';
  onTabChange: (tab: 'explore' | 'declared') => void;
}

export function CalendarTabs({ activeTab, onTabChange }: CalendarTabsProps) {
  return (
    <Flex width="100%" justify="space-between" align="center">
      <Button
        variant="unstyled"
        position="relative"
        fontSize="16px"
        fontWeight="600"
        width="50%"
        color={activeTab === 'explore' ? '#0468C1' : '#838383'}
        _hover={{ color: activeTab === 'explore' ? '#0468C1' : '#0468C1' }}
        onClick={() => onTabChange('explore')}
        pb="8px"
      >
        Explore Fillable Absences
        <Box
          position="absolute"
          left={0}
          right={0}
          bottom="0"
          height={activeTab === 'explore' ? '2px' : '1px'}
          bg={activeTab === 'explore' ? '#0468C1' : '#D1D1D1'}
        />
      </Button>

      <Button
        variant="unstyled"
        position="relative"
        fontSize="16px"
        fontWeight="600"
        width="50%"
        color={activeTab === 'declared' ? '#0468C1' : '#838383'}
        _hover={{ color: activeTab === 'declared' ? '#0468C1' : '#0468C1' }}
        onClick={() => onTabChange('declared')}
      >
        My Declared & Filled Absences
        <Box
          position="absolute"
          left={0}
          right={0}
          bottom="0"
          height={activeTab === 'declared' ? '2px' : '1px'}
          bg={activeTab === 'declared' ? '#0468C1' : '#D1D1D1'}
        />
      </Button>
    </Flex>
  );
}
