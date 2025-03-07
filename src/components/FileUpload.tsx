import { FormControl, FormLabel, Input, Text } from '@chakra-ui/react';

interface FileUploadProps {
  lessonPlan: File | null;
  setLessonPlan: (lessonPlan: File | null) => void;
  label?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  lessonPlan,
  setLessonPlan,
  label = 'Lesson Plan',
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      setLessonPlan(selectedFile);
    }
  };

  return (
    <FormControl>
      <FormLabel sx={{ display: 'flex' }}>
        <Text textStyle="h4">{label}</Text>
      </FormLabel>
      <Input
        type="file"
        onChange={handleFileChange}
        accept="application/pdf"
        p={1}
      />
      {lessonPlan && (
        <Text fontSize="sm" mt={1}>
          Selected file: {lessonPlan.name}
        </Text>
      )}
    </FormControl>
  );
};
