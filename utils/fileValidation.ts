import { formatFileSize } from './formatFileSize';

export const ALLOWED_FILE_TYPES = ['application/pdf'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

function validateFile(file: File) {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only PDF files are allowed.' };
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Max size is ${formatFileSize(MAX_FILE_SIZE)}.`,
    };
  }
  return { valid: true };
}

export function validateFileWithToast(
  file: File,
  showToast: (args: { description: string; status: 'error' }) => void
): { valid: boolean } {
  const { valid, error } = validateFile(file);

  if (!valid && error) {
    showToast({
      description: error,
      status: 'error',
    });
  }

  return { valid };
}
