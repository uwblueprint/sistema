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
import { validateFileWithToast } from '@utils/fileValidation';
import { formatFileSize } from '@utils/formatFileSize';
import { LessonPlanFile } from '@utils/types';
import { useEffect, useRef, useState } from 'react';
import { FiFileText } from 'react-icons/fi';
import { useCustomToast } from '../CustomToast';

interface FileUploadProps {
  lessonPlan: File | null;
  setLessonPlan: (file: File | null) => void | Promise<void>;
  existingFile?: LessonPlanFile | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  lessonPlan,
  setLessonPlan,
  existingFile,
}) => {
  const theme = useTheme();
  const showToast = useCustomToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (lessonPlan) {
      const url = URL.createObjectURL(lessonPlan);
      setLocalUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setLocalUrl(null);
    }
  }, [lessonPlan]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const { valid } = validateFileWithToast(file, showToast);
    if (!valid) {
      setIsBusy(false);
      await Promise.resolve(setLessonPlan(null));
      return;
    }

    setIsBusy(true);
    try {
      await Promise.resolve(setLessonPlan(file));
    } finally {
      setIsBusy(false);
    }
  };

  const handleSwap = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isBusy) inputRef.current?.click();
  };

  const fileToDisplay = lessonPlan
    ? { name: lessonPlan.name, size: lessonPlan.size, url: localUrl! }
    : existingFile;

  const disabled = isBusy;

  if (fileToDisplay) {
    return (
      <>
        <Link href={fileToDisplay.url} isExternal w="100%">
          <Flex
            w="100%"
            minH="48px"
            border="1px solid"
            borderColor={theme.colors.neutralGray[300]}
            borderRadius="10px"
            px="16px"
            py="10px"
            bg={theme.colors.buttonBackground}
            align="center"
            justify="space-between"
            gap={3}
          >
            <Flex align="center">
              <Box boxSize="24px">
                <FiFileText size="24px" color={theme.colors.primaryBlue[300]} />
              </Box>
              <Box ml="12px">
                <Text textStyle="caption" wordBreak="break-word" maxW="220px">
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
                  boxSize="15px"
                />
              }
              size="sm"
              variant="ghost"
              onClick={handleSwap}
              isDisabled={disabled}
            />
          </Flex>
        </Link>
        <Input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          display="none"
          onChange={handleFileChange}
          disabled={disabled}
        />
      </>
    );
  }

  const dashSize = 9;
  const gapSize = 6;
  const offset = 4;
  const borderColor = '#C5C8D8';

  return (
    <>
      <Box
        onClick={handleSwap}
        borderColor="outline"
        bg={disabled ? 'neutralGray.50' : 'transparent'}
        opacity={disabled ? 0.6 : 1}
        pointerEvents={disabled ? 'none' : 'auto'}
        borderRadius="10px"
        p={5}
        textAlign="center"
        cursor={disabled ? 'not-allowed' : 'pointer'}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        sx={{
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: `
              /* top border */
              linear-gradient(to right, 
                transparent ${offset}px, 
                ${borderColor} ${offset}px, 
                ${borderColor} ${offset + dashSize}px, 
                transparent ${offset + dashSize}px
              ) top left / ${dashSize + gapSize}px 1px repeat-x,
              
              /* bottom border */
              linear-gradient(to right, 
                transparent ${offset}px, 
                ${borderColor} ${offset}px, 
                ${borderColor} ${offset + dashSize}px, 
                transparent ${offset + dashSize}px
              ) bottom left / ${dashSize + gapSize}px 1px repeat-x,
              
              /* left border */
              linear-gradient(to bottom, 
                transparent ${offset}px, 
                ${borderColor} ${offset}px, 
                ${borderColor} ${offset + dashSize}px, 
                transparent ${offset + dashSize}px
              ) top left / 1px ${dashSize + gapSize}px repeat-y,
              
              /* right border */
              linear-gradient(to bottom, 
                transparent ${offset}px, 
                ${borderColor} ${offset}px, 
                ${borderColor} ${offset + dashSize}px, 
                transparent ${offset + dashSize}px
              ) top right / 1px ${dashSize + gapSize}px repeat-y
            `,
            pointerEvents: 'none',
          },
        }}
      >
        <Image src="/images/upload.svg" alt="Upload" width={10} height={10} />
        <Text textStyle="subtitle">Upload PDF</Text>
      </Box>
      <Input
        id="fileUpload"
        name="fileUpload"
        ref={inputRef}
        type="file"
        accept="application/pdf"
        display="none"
        onChange={handleFileChange}
        disabled={disabled}
      />
    </>
  );
};
