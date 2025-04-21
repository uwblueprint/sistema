import {
  Box,
  Flex,
  IconButton,
  Image,
  Input,
  Link,
  Text,
  useTheme,
} from '@chakra-ui/react';
import { FiFileText } from 'react-icons/fi';
import { LessonPlanFile } from '@utils/types';
import { useRef, useState, useEffect } from 'react';
import { useCustomToast } from '../CustomToast';

interface FileUploadProps {
  lessonPlan: File | null;
  setLessonPlan: (file: File | null) => void;
  existingFile?: LessonPlanFile | null;
  isDisabled?: boolean;
}

const formatFileSize = (sizeInBytes: number) => {
  if (sizeInBytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  let index = 0;
  let size = sizeInBytes;

  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index++;
  }

  return `${size.toFixed(1)} ${units[index]}`;
};

export const FileUpload: React.FC<FileUploadProps> = ({
  lessonPlan,
  setLessonPlan,
  existingFile,
  isDisabled,
}) => {
  const theme = useTheme();
  const showToast = useCustomToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localUrl, setLocalUrl] = useState<string | null>(null);

  useEffect(() => {
    if (lessonPlan) {
      const url = URL.createObjectURL(lessonPlan);
      setLocalUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setLocalUrl(null);
    }
  }, [lessonPlan]);

  const validateAndSetFile = (file: File) => {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      setLessonPlan(file);
    } else {
      showToast({
        description: 'Please upload a valid PDF file.',
        status: 'error',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleSwap = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    inputRef.current?.click();
  };

  const fileToDisplay = lessonPlan
    ? {
        name: lessonPlan.name,
        size: lessonPlan.size,
        url: localUrl,
      }
    : existingFile;

  return fileToDisplay ? (
    <>
      <Link href={fileToDisplay.url || '#'} isExternal width="100%">
        <Flex
          width="100%"
          minHeight="48px"
          borderColor={theme.colors.neutralGray[300]}
          borderWidth="1px"
          borderRadius="10px"
          px="16px"
          py="10px"
          bg={theme.colors.buttonBackground}
          align="center"
          justify="space-between"
          gap={3}
        >
          <Flex align="center">
            <Box
              boxSize="24px"
              flexShrink={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FiFileText size="24px" color={theme.colors.primaryBlue[300]} />
            </Box>
            <Box ml="12px">
              <Text textStyle="caption" wordBreak="break-word" maxWidth="220px">
                {fileToDisplay.name}
              </Text>
              {fileToDisplay.size && (
                <Text
                  fontSize={theme.textStyles.body.fontSize}
                  color={theme.colors.text.subtitle}
                >
                  {formatFileSize(fileToDisplay.size)}
                </Text>
              )}
            </Box>
          </Flex>
          <IconButton
            aria-label="Swap file"
            icon={
              <Image
                src="/images/arrow_swap.svg"
                alt="Swap icon"
                width="15px"
                height="15px"
              />
            }
            size="sm"
            variant="ghost"
            onClick={handleSwap}
            isDisabled={isDisabled}
          />
        </Flex>
      </Link>
      <Input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        display="none"
        onChange={handleFileChange}
        disabled={isDisabled}
      />
    </>
  ) : (
    <>
      <Box
        as="label"
        htmlFor="fileUpload"
        border="1px dashed"
        borderColor="outline"
        bg={isDisabled ? 'neutralGray.50' : 'transparent'}
        opacity={isDisabled ? 0.6 : 1}
        pointerEvents={isDisabled ? 'none' : 'auto'}
        borderRadius="10px"
        p={5}
        textAlign="center"
        cursor={isDisabled ? 'not-allowed' : 'pointer'}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Image src="/images/upload.svg" alt="Upload" width={10} height={10} />
        <Text textStyle="subtitle">Upload PDF</Text>
      </Box>
      <Input
        id="fileUpload"
        name="fileUpload"
        ref={inputRef}
        type="file"
        onChange={handleFileChange}
        accept="application/pdf"
        display="none"
        disabled={isDisabled}
      />
    </>
  );
};
