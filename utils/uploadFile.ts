export const uploadFile = async (file: File): Promise<string | null> => {
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
