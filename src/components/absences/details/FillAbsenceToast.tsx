import { Box, Text, useTheme } from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';

const ClaimAbsenceToast = ({ firstName, date, success }) => {
  const theme = useTheme();

  const modalColor = success
    ? theme.colors.positiveGreen[200]
    : theme.colors.errorRed[200];

  const message = success
    ? `You have successfully filled `
    : `There was an error in filling `;

  const Icon = success ? CheckCircleIcon : WarningIcon;

  return (
    <Box
      bg="white"
      width="360px"
      height="60px"
      border="1px solid"
      borderColor={modalColor}
      borderRadius="md"
      px={3}
      py={3}
      display="flex"
      alignItems="center"
      boxShadow="md"
    >
      <Box mr={4}>
        <Icon boxSize="30px" color={modalColor} />
      </Box>
      <Text fontSize="14px" color="black">
        {message}
        <Text as="span" fontWeight="bold">
          {firstName}&apos;s
        </Text>{' '}
        absence on{' '}
        <Text as="span" fontWeight="bold">
          {date}.
        </Text>
      </Text>
    </Box>
  );
};

export default ClaimAbsenceToast;
