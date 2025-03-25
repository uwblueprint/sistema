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

interface SystemSettingsProps {
  allowedAbsences: number;
  originalAbsenceCap: number;
  handleUpdateAbsenceCap: (value: number) => void;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({
  allowedAbsences,
  originalAbsenceCap,
  handleUpdateAbsenceCap,
}) => {
  const handleChange = (value: number) => {
    if (value !== originalAbsenceCap) {
      handleUpdateAbsenceCap(value);
    }
  };

  return (
    <Box>
      <VStack align="stretch" spacing={3}>
        <FormControl>
          <FormLabel>Allowed Absences</FormLabel>
          <NumberInput
            value={allowedAbsences}
            onChange={(_, value) => handleChange(value)}
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
