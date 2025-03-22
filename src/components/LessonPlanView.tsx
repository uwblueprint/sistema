import { Link, Text, Flex, Image, Box, IconButton } from '@chakra-ui/react';
import { FiFileText } from 'react-icons/fi';
import { VscArrowSwap } from 'react-icons/vsc';

const LessonPlanDisplay = ({
  href,
  fileName,
  fileSize,
  isUserAbsentTeacher,
}) => {
  return (
    <Flex
      width="100%"
      height="48px"
      borderColor="#D2D2D2"
      borderWidth="1px"
      borderRadius="10px"
      p={'16px'}
      align="center"
      bg="#FDFDFD"
      justify="space-between"
    >
      <Link href={href} isExternal width="100%">
        <Flex align="center">
          <FiFileText size="24px" color="#0468C1" />
          <Box ml="12px">
            <Text fontSize="12px" color="#373636">
              {fileName}
            </Text>
            {fileSize && (
              <Text fontSize="11px" color="#838383">
                {fileSize}
              </Text>
            )}
          </Box>
        </Flex>
      </Link>

      {isUserAbsentTeacher && (
        <IconButton
          aria-label="Swap Lesson Plan"
          icon={<VscArrowSwap size="15px" color="#656565" />}
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
  return (
    <Flex
      align="center"
      justify="center"
      gap="20px"
      width="302px"
      sx={{
        padding: '24px',
        borderRadius: '10px',
        border: '1px solid #D2D2D2',
      }}
    >
      <Image
        src="/images/hot_air_balloon.svg"
        alt="No lesson plan uploaded"
        width="57px"
        height="54.4px"
      />

      <Text fontSize="11px" color="#8C8C8C" width="154px">
        <strong>{absentTeacherFirstName}</strong> has not uploaded a lesson plan
        yet. {isUserSubstituteTeacher && " We'll let you know when they do!"}
      </Text>
    </Flex>
  );
};

const NoLessonPlanDeclaredDisplay = ({}) => {
  return (
    <Flex width="100%">
      <Text fontSize="11px" color="#8C8C8C">
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
