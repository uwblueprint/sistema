import React from 'react';
import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { Change } from './SystemChangesConfirmationDialog';

interface SystemSettingsProps {
  allowedAbsences: number;
  originalAbsenceCap: number;
  handleAddChange: (change: Change) => void;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({
  allowedAbsences,
  originalAbsenceCap,
  handleAddChange,
}) => {
  const handleAbsenceCapChange = (value: number) => {
    if (value !== originalAbsenceCap) {
      handleAddChange({
        type: 'update',
        entity: 'setting',
        data: { absenceCap: value },
        displayText: `Updated Allowed Absences "${originalAbsenceCap}" → "${value}"`,
      });
    }
  };

  return (
    <Box>
      <VStack align="stretch" spacing={3}>
        <FormControl>
          <FormLabel>Allowed Absences</FormLabel>
          <NumberInput
            value={allowedAbsences}
            onChange={(_, value) => handleAbsenceCapChange(value)}
            min={1}
            max={100}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
      </VStack>
    </Box>
  );
};

export default SystemSettings;
