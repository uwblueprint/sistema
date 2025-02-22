import { Button, Link, Text } from '@chakra-ui/react';

const LessonPlanView = ({ lessonPlan, absentTeacherFirstName }) => {
  return lessonPlan ? (
    <Button as={Link} href={lessonPlan} isExternal colorScheme="blue" mt={3}>
      Download Lesson Plan
    </Button>
  ) : (
    <Text mt={3} color="gray.500">
      <strong>{absentTeacherFirstName}</strong> has not uploaded a lesson plan
      yet.
    </Text>
  );
};

export default LessonPlanView;
