import { Box, Image, Input, Text } from '@chakra-ui/react';
import { LessonPlanFile } from '@utils/types';
import { useRef, useState } from 'react';
import { useCustomToast } from '../CustomToast';

interface FileUploadProps {
  lessonPlan: File | null;
  setLessonPlan: (file: File | null) => void;
  existingFile?: LessonPlanFile | null;
  isDisabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  lessonPlan,
  setLessonPlan,
  existingFile,
  isDisabled,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const showToast = useCustomToast();

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
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isDisabled) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    if (isDisabled) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isDisabled) return;
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  return (
    <>
      <Box
        as="label"
        htmlFor="fileUpload"
        border="1px dashed"
        borderColor={
          isDisabled
            ? 'neutralGray.300'
            : isDragging
              ? 'primaryBlue.300'
              : 'outline'
        }
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
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Image src="/images/upload.svg" alt="Upload" width={10} height={10} />
        <Text textStyle="subtitle">
          {lessonPlan
            ? `Selected file: ${lessonPlan.name}`
            : existingFile
              ? `Selected file: ${existingFile.name}`
              : 'Upload PDF'}
        </Text>
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
