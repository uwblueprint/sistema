import {
  Box,
  Flex,
  IconButton,
  Image,
  Link,
  Text,
  useTheme,
  VStack,
  Button,
  HStack,
  useToast,
} from '@chakra-ui/react';
import { FiFileText } from 'react-icons/fi';
import { VscArrowSwap } from 'react-icons/vsc';
import { FileUpload } from './FileUpload';
import React, { useState, useEffect } from 'react';

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
  onSwapClick,
  isAdminMode,
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
            onClick={onSwapClick}
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

const NoLessonPlanDeclaredDisplay = ({ onLessonPlanUploaded }) => {
  const theme = useTheme();
  const toast = useToast();

  const [lessonPlan, setLessonPlan] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadFile = async (file) => {
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

  const handleUploadFile = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (lessonPlan) {
        const lessonPlanUrl = await uploadFile(lessonPlan);
        console.log('File uploaded successfully:', lessonPlanUrl);
        setLessonPlan(null);

        if (onLessonPlanUploaded) {
          onLessonPlanUploaded(lessonPlanUrl);
        }
        //TODO: Add the patch to the DB, and also make sure that this component knows which absence to edit / interact with
        toast({
          title: 'Success',
          description: `You have successfully uploaded your lesson plan.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    setLessonPlan(null);
  };
  return (
    <VStack>
      <FileUpload lessonPlan={lessonPlan} setLessonPlan={setLessonPlan} />

      {lessonPlan && (
        <HStack width={'full'}>
          <Button
            type="submit"
            colorScheme="blue"
            fontSize="12px"
            isLoading={isSubmitting}
            loadingText="Submitting"
            width="full"
            height="44px"
            onClick={handleUploadFile}
          >
            Save Changes
          </Button>
          <Button
            colorScheme="gray"
            fontSize="12px"
            width="full"
            height="44px"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </HStack>
      )}
    </VStack>
  );
};

const LessonPlanView = ({
  lessonPlan: initialLessonPlan,
  absentTeacherFirstName,
  isUserAbsentTeacher,
  isUserSubstituteTeacher,
  isAdminMode,
}) => {
  const [currentLessonPlan, setCurrentLessonPlan] = useState(initialLessonPlan);
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    setCurrentLessonPlan(initialLessonPlan);
  }, [initialLessonPlan]);

  const handleLessonPlanUploaded = (newLessonPlanUrl) => {
    setCurrentLessonPlan(newLessonPlanUrl);
    setShowUploadForm(false);
  };

  const handleSwapClick = () => {
    setShowUploadForm(true);
  };

  const getFileName = (url) =>
    url ? url.split('/').pop() || 'Lesson Plan' : '';
  const getFileSize = (url) => (url ? 'PDF Document' : '');

  if (showUploadForm && isUserAbsentTeacher) {
    return (
      <NoLessonPlanDeclaredDisplay
        onLessonPlanUploaded={handleLessonPlanUploaded}
      />
    );
  }

  if (currentLessonPlan) {
    return (
      <LessonPlanDisplay
        href={currentLessonPlan.url}
        fileName={currentLessonPlan.name}
        fileSize={currentLessonPlan.size}
        isUserAbsentTeacher={isUserAbsentTeacher}
        isAdminMode={isAdminMode}
        onSwapClick={handleSwapClick}
      />
    );
  }

  if (isUserAbsentTeacher && !isAdminMode) {
    return (
      <NoLessonPlanDeclaredDisplay
        onLessonPlanUploaded={handleLessonPlanUploaded}
      />
    );
  }

  return (
    <NoLessonPlanViewingDisplay
      absentTeacherFirstName={absentTeacherFirstName}
      isUserSubstituteTeacher={isUserSubstituteTeacher}
    />
  );
};

export default LessonPlanView;
