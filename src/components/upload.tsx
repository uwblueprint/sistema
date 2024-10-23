import { useState } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Text,
  useToast,
} from '@chakra-ui/react';

interface FileUploadProps {
  onFileUpload: (fileId: string | null) => void;
  label?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  label = 'Attachment',
}) => {
  const [file, setFile] = useState<File | null>(null);
  const toast = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      try {
        var fileId = await uploadFile(selectedFile);
        onFileUpload(fileId);
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

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message);
    }
    console.log(data);
    return `https://drive.google.com/file/d/${data.fileId}/view}`;
  };

  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <Input
        type="file"
        onChange={handleFileChange}
        accept="application/pdf"
        p={1}
      />
      {file && (
        <Text fontSize="sm" mt={1}>
          Selected file: {file.name}
        </Text>
      )}
    </FormControl>
  );
};
