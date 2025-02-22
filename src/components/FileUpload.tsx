import { useState } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Text,
  useToast,
  Progress,
} from '@chakra-ui/react';

interface FileUploadProps {
  onFileUpload: (fileId: string | null) => void;
  label?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  label = 'Lesson Plan',
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setUploading(true);

      try {
        const fileId = await uploadFile(selectedFile);
        onFileUpload(fileId);
        toast({
          title: 'Success',
          description: 'File uploaded successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        toast({
          title: 'Error',
          description: 'Failed to upload file',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        onFileUpload(null);
      } finally {
        setUploading(false);
      }
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);

    const res = await fetch('/api/uploadFile/', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to upload file');
    }

    const data = await res.json();
    return `https://drive.google.com/file/d/${data.fileId}/view`;
  };

  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <Input
        type="file"
        onChange={handleFileChange}
        accept="application/pdf"
        p={1}
        disabled={uploading}
      />
      {uploading && <Progress size="xs" isIndeterminate mt={2} />}
      {file && !uploading && (
        <Text fontSize="sm" mt={1}>
          Selected file: {file.name}
        </Text>
      )}
    </FormControl>
  );
};
