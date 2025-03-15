import { Link, Text, Flex, Image, Box, IconButton } from '@chakra-ui/react';
import { FiFileText } from 'react-icons/fi';
import { VscArrowSwap } from 'react-icons/vsc';

const LessonPlanDisplay = ({ href, fileName, fileSize }) => {
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
      <Link href={href} isExternal>
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

      <IconButton
        aria-label="Swap Lesson Plan"
        icon={<VscArrowSwap size="15px" />}
        size="5px"
        variant="ghost"
        color="#656565"
      />
    </Flex>
  );
};

const NoLessonPlanFillingDisplay = ({ absentTeacherFirstName }) => {
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
        yet.
      </Text>
    </Flex>
  );
};

const NoLessonPlanDeclaredDisplay = ({}) => {
  return (
    <Flex>
      <Text fontSize="11px" color="#8C8C8C" width="154px">
        TO-DO: Upload lesson plan + attach to absence
      </Text>
    </Flex>
  );
};

const LessonPlanView = ({ lessonPlan, absentTeacherFirstName }) => {
  const getFileName = (url) => (url ? 'File name: TO-DO' : '');
  const getFileSize = (url) => (url ? 'File size: TO-DO' : '');

  return lessonPlan ? (
    <LessonPlanDisplay
      href={lessonPlan}
      fileName={getFileName(lessonPlan)}
      fileSize={getFileSize(lessonPlan)}
    />
  ) : (
    <NoLessonPlanFillingDisplay
      absentTeacherFirstName={absentTeacherFirstName}
    />
  );
};

export default LessonPlanView;
