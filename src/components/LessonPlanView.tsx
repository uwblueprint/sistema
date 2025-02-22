import { Button, Link, Text } from '@chakra-ui/react';

const LessonPlanView = ({ lessonPlan, absentTeacherFirstName }) => {
  return lessonPlan ? (
    <Button as={Link} href={lessonPlan} isExternal mt={3}>
      Download Lesson Plan
    </Button>
  ) : (
    <Text mt={3} fontSize="11px" color="#8C8C8C">
      <strong>{absentTeacherFirstName}</strong> has not uploaded a lesson plan
      yet.
    </Text>
  );
};

export default LessonPlanView;
