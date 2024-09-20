import { Container } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';

type DriveFile = {
  id: string;
  name: string;
};

export default function FileUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);

    try {
      const res = await fetch('/api/uploadFile/', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        await handleSearch();
        // Remove the deleted file from the state
        alert(data.message);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error Uploading file:', error);
      alert('Error Uploading file');
    }
  };

  const handleSearch = useCallback(async () => {
    try {
      const res = await fetch('/api/searchDrive/');
      const data = await res.json();
      console.log('Search result:', data.results.files);
      setDriveFiles(data.results.files);
    } catch (error) {
      console.error('Error searching files:', error);
    }
  }, []);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const handleFileDelete = async (fileId: string) => {
    try {
      const response = await fetch(`/api/deleteFile?fileId=${fileId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (response.ok) {
        await handleSearch();
        alert(data.message);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file');
    }
  };

  const handleFileClick = (fileId: string) => {
    window.open(`https://drive.google.com/file/d/${fileId}/view`, '_blank');
  };

  return (
    <Container>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          onChange={handleFileChange}
          accept="application/pdf"
        />
        <button type="submit">Upload</button>
      </form>
      <form onSubmit={handleSearch}>
        <button type="submit">Search</button>
      </form>
      <div className="Search Results">
        {driveFiles.map((file) => (
          <div key={file.id}>
            <button onClick={() => handleFileClick(file.id)}>
              {file.name + '_________'}
            </button>
            <button onClick={() => handleFileDelete(file.id)}>Delete</button>
            <br />
          </div>
        ))}
      </div>
    </Container>
  );
}
