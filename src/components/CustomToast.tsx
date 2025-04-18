import { Alert, AlertIcon, Box, Text, useToast } from '@chakra-ui/react';
import { ReactNode } from 'react';

type ToastStatus = 'success' | 'error';

interface CustomToastProps {
  description?: string | ReactNode;
  status?: ToastStatus;
  icon?: ReactNode;
}

export const CustomToast: React.FC<CustomToastProps> = ({
  description,
  status = 'success',
  icon,
}) => {
  return (
    <Alert
      status={status}
      variant="subtle"
      bg="white"
      border="1px solid"
      borderColor={status === 'error' ? 'errorRed.200' : 'positiveGreen.200'}
      borderRadius="md"
      px={3}
      py={3}
      width="360px"
      alignItems="center"
      boxShadow="md"
      sx={{
        '& [data-status="success"] svg': {
          color: 'positiveGreen.200',
        },
        '& [data-status="error"] svg': {
          color: 'errorRed.200',
        },
      }}
    >
      {icon ?? <AlertIcon boxSize="30px" />}
      <Box pl={2}>
        {typeof description === 'string' ? (
          <Text fontSize="14px" color="black">
            {description}
          </Text>
        ) : (
          <Box fontSize="14px" color="black">
            {description}
          </Box>
        )}
      </Box>
    </Alert>
  );
};

export const useCustomToast = () => {
  const toast = useToast();

  return ({
    description,
    status = 'success',
    icon,
  }: {
    description?: string | ReactNode;
    status?: string;
    icon?: ReactNode;
  }) => {
    const validStatuses = ['success', 'error'] as const;
    const safeStatus = validStatuses.includes(status as ToastStatus)
      ? (status as ToastStatus)
      : 'success';

    toast({
      isClosable: true,
      position: 'bottom-left',
      render: () => (
        <CustomToast
          description={description}
          status={safeStatus}
          icon={icon}
        />
      ),
    });
  };
};
