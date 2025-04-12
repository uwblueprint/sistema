import {
  Box,
  HStack,
  Icon,
  NumberInput,
  NumberInputField,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { LuInfo } from 'react-icons/lu';

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
  const [inputValue, setInputValue] = useState<string>(
    allowedAbsences.toString()
  );

  const handleChange = (valueAsString: string, valueAsNumber: number) => {
    // Update the displayed input value
    setInputValue(valueAsString);

    // Only update the actual value if it's a valid number and different from original
    if (!isNaN(valueAsNumber) && valueAsNumber !== originalAbsenceCap) {
      handleUpdateAbsenceCap(valueAsNumber);
    }
  };

  // Keep input value in sync with allowedAbsences
  React.useEffect(() => {
    setInputValue(allowedAbsences.toString());
  }, [allowedAbsences]);

  return (
    <Box py={0}>
      <HStack justify="space-between" alignItems="flex-start">
        <VStack align="start" spacing={1}>
          <HStack spacing={2} alignItems="center">
            <Text textStyle="h4">Allowed Absences</Text>
            <Tooltip
              hasArrow
              placement="top"
              label={
                <Box>
                  <Text>
                    The{' '}
                    <Text as="span" color="primaryBlue.300" fontWeight="bold">
                      recommended
                    </Text>{' '}
                    maximum absences for teachers. Appears in a teacher&apos;s{' '}
                    <Text as="span" color="primaryBlue.300" fontWeight="bold">
                      user profile
                    </Text>{' '}
                    and acts as a guideline.
                  </Text>
                </Box>
              }
              width="300px"
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <Icon as={LuInfo} color="blue.500" />
              </span>
            </Tooltip>
          </HStack>
          <Text textStyle="subtitle" color="text.subtitle">
            Per teacher per school year
          </Text>
        </VStack>
        <NumberInput
          value={inputValue}
          onChange={handleChange}
          width="83px"
          variant="unstyled"
          keepWithinRange={true}
          min={0}
        >
          <NumberInputField
            textAlign="left"
            borderRadius="md"
            border="1px solid"
            borderColor="gray.200"
            textStyle="subtitle"
            fontSize="13px"
            color="text.body"
            paddingX={3}
            paddingY={3}
          />
        </NumberInput>
      </HStack>
    </Box>
  );
};

export default SystemSettings;
