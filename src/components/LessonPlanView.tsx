import {
  Box,
  Flex,
  IconButton,
  Image,
  Link,
  Text,
  useTheme,
} from '@chakra-ui/react';
import { FiFileText } from 'react-icons/fi';
import { VscArrowSwap } from 'react-icons/vsc';

const LessonPlanDisplay = ({
  href,
  fileName,
  fileSize,
  isUserAbsentTeacher,
}) => {
  const theme = useTheme();

  return (
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
      <Link href={href} isExternal width="100%">
        <Flex align="center">
          <FiFileText size="24px" color={theme.colors.primaryBlue[300]} />
          <Box ml="12px">
            <Text textStyle="caption">{fileName}</Text>
            {fileSize && (
              <Text
                fontSize={theme.textStyles.body.fontSize}
                color={theme.colors.text.subtitle}
              >
                {fileSize}
              </Text>
            )}
          </Box>
        </Flex>
      </Link>

      {isUserAbsentTeacher && (
        <IconButton
          aria-label="Swap Lesson Plan"
          icon={
            <VscArrowSwap size="15px" color={theme.colors.neutralGray[600]} />
          }
          size="sm"
          variant="ghost"
        />
      )}
    </Flex>
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

const NoLessonPlanDeclaredDisplay = () => {
  const theme = useTheme();

  return (
    <Flex width="100%">
      <Text
        fontSize={theme.textStyles.body.fontSize}
        color={theme.colors.neutralGray[500]}
      >
        Upload PDF component
      </Text>
    </Flex>
  );
};

const LessonPlanView = ({
  lessonPlan,
  absentTeacherFirstName,
  isUserAbsentTeacher,
  isUserSubstituteTeacher,
}) => {
  const getFileName = (url) => (url ? 'File name' : '');
  const getFileSize = (url) => (url ? 'File size' : '');

  return lessonPlan ? (
    <LessonPlanDisplay
      href={lessonPlan}
      fileName={getFileName(lessonPlan)}
      fileSize={getFileSize(lessonPlan)}
      isUserAbsentTeacher={isUserAbsentTeacher}
    />
  ) : isUserAbsentTeacher ? (
    <NoLessonPlanDeclaredDisplay />
  ) : (
    <NoLessonPlanViewingDisplay
      absentTeacherFirstName={absentTeacherFirstName}
      isUserSubstituteTeacher={isUserSubstituteTeacher}
    />
  );
};

export default LessonPlanView;
