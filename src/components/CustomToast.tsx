import {
  CheckCircleIcon,
  CloseIcon,
  InfoIcon,
  WarningIcon,
} from '@chakra-ui/icons';
import { Box, Text, useTheme, useToast } from '@chakra-ui/react';
import { ReactNode } from 'react';

const iconMap = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: CloseIcon,
  info: InfoIcon,
};

const colorMap = (theme) => ({
  success: theme.colors.positiveGreen[200],
  warning: theme.colors.warningOrange[300],
  error: theme.colors.errorRed[200],
  info: theme.colors.primaryBlue[300],
});

interface CustomToastProps {
  title?: string;
  description?: string | ReactNode;
  status?: 'success' | 'warning' | 'error' | 'info';
}

export const CustomToast: React.FC<CustomToastProps> = ({
  title,
  description,
  status = 'info',
}) => {
  const theme = useTheme();
  const Icon = iconMap[status] || InfoIcon;
  const color = colorMap(theme)[status];

  return (
    <Box
      bg="white"
      width="360px"
      border="1px solid"
      borderColor={color}
      borderRadius="md"
      px={3}
      py={3}
      display="flex"
      alignItems="center"
      boxShadow="md"
    >
      <Box mr={3} display="flex" alignItems="center">
        <Icon boxSize="30px" color={color} />
      </Box>
      <Box>
        {title && (
          <Text fontWeight="bold" fontSize="14px" mb="2px" color="black">
            {title}
          </Text>
        )}
        {description &&
          (typeof description === 'string' ? (
            <Text fontSize="14px" color="black">
              {description}
            </Text>
          ) : (
            <Box fontSize="14px" color="black">
              {description}
            </Box>
          ))}
      </Box>
    </Box>
  );
};

const allowedStatuses = ['success', 'warning', 'error', 'info'] as const;
type ToastStatus = (typeof allowedStatuses)[number];

function isToastStatus(value: any): value is ToastStatus {
  return allowedStatuses.includes(value);
}

export const useCustomToast = () => {
  const toast = useToast();

  return ({
    title,
    description,
    status = 'info',
  }: {
    title?: string;
    description?: string | ReactNode;
    status?: string;
  }) => {
    const safeStatus: ToastStatus = isToastStatus(status) ? status : 'info';

    toast({
      isClosable: true,
      position: 'bottom-left',
      render: () => (
        <CustomToast
          title={title}
          description={description}
          status={safeStatus}
        />
      ),
    });
  };
};
