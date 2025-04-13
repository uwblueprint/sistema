import {
  Box,
  Flex,
  IconButton,
  Image,
  Input,
  Link,
  Text,
  useTheme,
  useToast,
} from '@chakra-ui/react';
import { LessonPlanFile } from '@utils/types';
import { uploadFile } from '@utils/uploadFile';
import { useEffect, useRef, useState } from 'react';
import { FiFileText } from 'react-icons/fi';
import { FileUpload } from '../../ui/input/FileUpload';

const formatFileSize = (sizeInBytes: number) => {
  if (sizeInBytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let size = sizeInBytes;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const LessonPlanDisplay = ({
  href,
  fileName,
  fileSize,
  isUserAbsentTeacher,
  isAdminMode,
  onSwap,
  isDisabled,
}) => {
  const theme = useTheme();

  return (
    <Link href={href} isExternal width="100%">
      <Flex
        width="100%"
        height="48px"
        borderColor={theme.colors.neutralGray[300]}
        borderWidth="1px"
        borderRadius="10px"
        p="16px"
        align="center"
        bg={theme.colors.buttonBackground}
        justify="space-between"
      >
        <Flex align="center">
          <FiFileText size="24px" color={theme.colors.primaryBlue[300]} />
          <Box ml="12px">
            <Text textStyle="caption">{fileName}</Text>
            {fileSize && (
              <Text
                fontSize={theme.textStyles.body.fontSize}
                color={theme.colors.text.subtitle}
              >
                {formatFileSize(fileSize)}
              </Text>
            )}
          </Box>
        </Flex>

        {isUserAbsentTeacher && !isAdminMode && (
          <IconButton
            aria-label="Swap Lesson Plan"
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
            onClick={onSwap}
            isDisabled={isDisabled}
          />
        )}
      </Flex>
    </Link>
  );
};

const NoLessonPlanViewingDisplay = ({
  absentTeacherFirstName,
  isUserSubstituteTeacher,
}) => {
  const theme = useTheme();

  return (
    <Flex
      align="center"
      justify="center"
      gap="20px"
      width="302px"
      sx={{
        padding: '24px',
        borderRadius: '10px',
        border: `1px solid ${theme.colors.neutralGray[300]}`,
      }}
    >
      <Image
        src="/images/hot_air_balloon.svg"
        alt="No lesson plan uploaded"
        width="57px"
        height="54.4px"
      />

      <Text
        fontSize={theme.textStyles.body.fontSize}
        color={theme.colors.neutralGray[500]}
        width="154px"
      >
        <strong>{absentTeacherFirstName}</strong> has not uploaded a lesson plan
        yet. {isUserSubstituteTeacher && " We'll let you know when they do!"}
      </Text>
    </Flex>
  );
};

const LessonPlanView = ({
  lessonPlan,
  absentTeacherFirstName,
  isUserAbsentTeacher,
  isUserSubstituteTeacher,
  isAdminMode,
  absenceId,
  fetchAbsences,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const toast = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [localLessonPlan, setLocalLessonPlan] = useState<LessonPlanFile | null>(
    lessonPlan
  );

  useEffect(() => {
    setLocalLessonPlan(lessonPlan);
  }, [lessonPlan]);

  const handleSwap = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (file: File) => {
    if (!file || file.type !== 'application/pdf') return;

    setIsUploading(true);

    const fileUrl = await uploadFile(file);
    if (!fileUrl) {
      toast({
        title: 'Upload failed',
        description: 'Could not upload the lesson plan file.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsUploading(false);
      return;
    }

    const res = await fetch('/api/editAbsence', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: absenceId,
        lessonPlanFile: {
          name: file.name,
          size: file.size,
          url: fileUrl,
        },
      }),
    });

    if (res.ok) {
      const updatedPlan: LessonPlanFile = {
        id: -1,
        name: file.name,
        size: file.size,
        url: fileUrl,
      };

      setLocalLessonPlan(updatedPlan);

      toast({
        title: 'Lesson Plan Updated',
        description: 'Your lesson plan was successfully swapped.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      await fetchAbsences?.();
    } else {
      toast({
        title: 'Update failed',
        description: 'There was a problem updating the lesson plan.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }

    setIsUploading(false);
  };

  return localLessonPlan ? (
    <>
      <LessonPlanDisplay
        href={localLessonPlan.url}
        fileName={localLessonPlan.name}
        fileSize={localLessonPlan.size}
        isUserAbsentTeacher={isUserAbsentTeacher}
        isAdminMode={isAdminMode}
        onSwap={handleSwap}
        isDisabled={isUploading}
      />
      <Input
        type="file"
        ref={fileInputRef}
        display="none"
        accept="application/pdf"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileUpload(file);
          }
        }}
      />
    </>
  ) : isUserAbsentTeacher && !isAdminMode ? (
    <FileUpload
      lessonPlan={null}
      setLessonPlan={handleFileUpload}
      existingFile={null}
      isDisabled={isUploading}
    />
  ) : (
    <NoLessonPlanViewingDisplay
      absentTeacherFirstName={absentTeacherFirstName}
      isUserSubstituteTeacher={isUserSubstituteTeacher}
    />
  );
};

export default LessonPlanView;
