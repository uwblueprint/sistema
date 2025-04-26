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
import { uploadFile } from '@utils/uploadFile';
import { useEffect, useRef, useState } from 'react';
import { FiFileText } from 'react-icons/fi';
import { useCustomToast } from '../../CustomToast';
import { FileUpload } from '../FileUpload';
import { MailIcon } from '../modals/edit/EditAbsenceForm';

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
        minHeight="48px"
        borderColor={theme.colors.neutralGray[300]}
        borderWidth="1px"
        borderRadius="10px"
        px="16px"
        py="10px"
        bg={theme.colors.buttonBackground}
        align="center"
        justify="space-between"
        gap={3}
      >
        <Flex align="center">
          <Box
            boxSize="24px"
            flexShrink={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <FiFileText size="24px" color={theme.colors.primaryBlue[300]} />
          </Box>
          <Box ml="12px">
            <Text
              textStyle="caption"
              whiteSpace="normal"
              wordBreak="break-word"
              maxWidth="220px"
            >
              {fileName}
            </Text>
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
  const showToast = useCustomToast();
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
    const { valid } = validateFileWithToast(file, showToast);
    if (!valid) {
      setIsUploading(false);
      return;
    }

    setIsUploading(true);

    const fileUrl = await uploadFile(file);
    if (!fileUrl) {
      const errorMessage = 'Could not upload the lesson plan file.';
      console.error(errorMessage);
      showToast({ description: errorMessage, status: 'error' });
      setIsUploading(false);
      return;
    }

    const wasSwap = localLessonPlan !== null;

    try {
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

      if (!res.ok) {
        let errorMessage = 'Failed to update lesson plan: ';
        try {
          const errorData = await res.json();
          errorMessage += errorData?.error || res.statusText || 'Unknown error';
        } catch {
          errorMessage += res.statusText || 'Unknown error';
        }

        console.error(errorMessage);
        showToast({
          description: errorMessage,
          status: 'error',
          icon: <MailIcon bg="errorRed.200" />,
        });
        setIsUploading(false);
        return;
      }

      const uploadedPlan: LessonPlanFile = {
        id: -1,
        name: file.name,
        size: file.size,
        url: fileUrl,
      };

      setLocalLessonPlan(uploadedPlan);

      showToast({
        description: 'Confirmation emails have been sent.',
        status: 'success',
        icon: <MailIcon bg="positiveGreen.200" />,
      });

      await fetchAbsences?.();

      try {
        const uploadFileEmailRes = await fetch('/api/emails/uploadFile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ absenceId, isSwap: wasSwap }),
        });

        if (!uploadFileEmailRes.ok) {
          let errorMessage = 'Failed to send upload file email: ';
          try {
            const errorData = await uploadFileEmailRes.json();
            errorMessage +=
              errorData?.error ||
              uploadFileEmailRes.statusText ||
              'Unknown error';
          } catch {
            errorMessage += uploadFileEmailRes.statusText || 'Unknown error';
          }

          console.error(errorMessage);
          showToast({ description: errorMessage, status: 'error' });
        }
      } catch (err: any) {
        const errorMessage = err?.message
          ? `Error hitting upload file email endpoint: ${err.message}`
          : 'Error hitting upload file email endpoint.';
        console.error(errorMessage);
        showToast({ description: errorMessage, status: 'error' });
      }
    } catch (err: any) {
      const errorMessage = err?.message
        ? `Unexpected error while updating lesson plan: ${err.message}`
        : 'Unexpected error while updating lesson plan.';
      console.error(errorMessage);
      showToast({ description: errorMessage, status: 'error' });
    } finally {
      setIsUploading(false);
    }
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
