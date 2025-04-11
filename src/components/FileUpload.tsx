import {
  Box,
  FormControl,
  FormLabel,
  Image,
  Input,
  Text,
  useToast,
} from '@chakra-ui/react';
import { LessonPlanFile } from '@utils/types';
import { useRef, useState } from 'react';

interface FileUploadProps {
  lessonPlan: File | null;
  setLessonPlan: (file: File | null) => void;
  existingFile?: LessonPlanFile | null;
  label?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  lessonPlan,
  setLessonPlan,
  existingFile,
  label = 'Lesson Plan',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const validateAndSetFile = (file: File) => {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      setLessonPlan(file);
    } else {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a valid PDF file.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  return (
    <FormControl>
      <Text textStyle="h4" mb={2}>
        {label}
      </Text>
      <Box
        as="label"
        htmlFor="fileUpload"
        border="1px dashed"
        borderColor={isDragging ? 'primaryBlue.300' : 'outline'}
        borderRadius="10px"
        p={5}
        textAlign="center"
        cursor="pointer"
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
      />
    </FormControl>
  );
};
