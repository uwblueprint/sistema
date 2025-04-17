import { Alert, AlertIcon, Box, Text, useToast } from '@chakra-ui/react';
import { ReactNode } from 'react';

type ToastStatus = 'success' | 'error';

interface CustomToastProps {
  description?: string | ReactNode;
  status?: ToastStatus;
}

export const CustomToast: React.FC<CustomToastProps> = ({
  description,
  status = 'success',
}) => {
  return (
    <Alert
      status={status}
      variant="subtle"
      bg="white"
      border="1px solid"
      borderColor={status === 'error' ? '#BF3232' : '#5A8934'}
      borderRadius="md"
      px={3}
      py={3}
      width="360px"
      alignItems="center"
      boxShadow="md"
      sx={{
        '& [data-status="success"] svg': {
          color: '#5A8934',
        },
        '& [data-status="error"] svg': {
          color: '#BF3232',
        },
      }}
    >
      <AlertIcon boxSize="30px" />
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

export interface CustomToastOptions {
  description?: string | ReactNode;
  status?: ToastStatus;
}

export const useCustomToast = () => {
  const toast = useToast();

  return ({ description, status = 'success' }: CustomToastOptions) => {
    const validStatuses = ['success', 'error'] as const;
    const safeStatus = validStatuses.includes(status as ToastStatus)
      ? (status as ToastStatus)
      : 'success';

    toast({
      isClosable: true,
      position: 'bottom-left',
      render: () => (
        <CustomToast description={description} status={safeStatus} />
      ),
    });
  };
};
