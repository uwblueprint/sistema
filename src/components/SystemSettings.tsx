import React from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  NumberInput,
  NumberInputField,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
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
  const handleChange = (value: number) => {
    if (value !== originalAbsenceCap) {
      handleUpdateAbsenceCap(value);
    }
  };

  return (
    <Box py={4}>
      <HStack justify="space-between" alignItems="flex-start">
        <VStack align="start" spacing={1}>
          <HStack spacing={2} alignItems="center">
            <Text textStyle="h4" fontWeight="500">
              Allowed Absences
            </Text>
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
          value={allowedAbsences}
          onChange={(_, value) => handleChange(value)}
          width="83px"
          variant="unstyled"
          // paddingX={2}
          // paddingY={3}
          // padding={2}
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
