import { Button, Link, Text, Flex, Image } from '@chakra-ui/react';

const LessonPlanView = ({ lessonPlan, absentTeacherFirstName }) => {
  return lessonPlan ? (
    <Button as={Link} href={lessonPlan} isExternal mt={3}>
      To-do: Download Lesson Plan
    </Button>
  ) : (
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

export default LessonPlanView;
