const { PrismaClient } = require('@prisma/client');

// Create a new instance of PrismaClient
const prisma = new PrismaClient();

// Define the types for absence and teacher
type Absence = {
  lessonDate: Date;
  locationId: number;
  subjectId: number;
  lessonPlan: string | null;
};

type Teacher = {
  id: number;
  email: string;
  name: string; // Added name
  absences: Absence[];
};

// Helper function to mock sending an email (this will now send actual emails)
const reminderEmailSend = async (
  teacherId: number,
  teacherName: string,
  teacherEmail: string,
  daysUntilLesson: number
) => {
  const subject = `Reminder: Lesson Plan Due in ${daysUntilLesson} Days`;
  const text = `Dear ${teacherName},\n\nThis is a reminder that you have a lesson scheduled in ${daysUntilLesson} days. Please ensure your lesson plan is submitted.\n\nThank you!`;

  try {
    const response = await fetch('http://localhost:3000/api/sendEmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'sistema@uwblueprint.org',
        // to:teacherEmail,
        subject: subject,
        text: text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || 'Failed to send email');
    }

    const data = await response.json();
    console.log(data.message); // Log success message
  } catch (error: any) {
    console.error(
      `Error sending email to Teacher ID: ${teacherId}, Email: ${teacherEmail}:`,
      error.message
    );
  }
};

// Helper function to calculate the difference in days between two dates
const getDifferenceInDays = (date1: Date, date2: Date): number => {
  const timeDifference = date1.getTime() - date2.getTime();
  return Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
};

// Function to get teachers with pending lesson plans
const getTeachersWithPendingLessonPlans = async (): Promise<Teacher[]> => {
  const teachersWithPendingPlans = await prisma.user.findMany({
    where: {
      absences: {
        some: {
          lessonPlan: null,
          lessonDate: {
            gte: new Date(), // Only fetch future absences
          },
        },
      },
    },
    include: {
      absences: {
        where: {
          lessonPlan: null, // Fetch absences where lesson plans are not updated
        },
      },
    },
  });

  // Map absences for each teacher
  return teachersWithPendingPlans.map((teacher) => ({
    id: teacher.id,
    email: teacher.email,
    name: `${teacher.firstName} ${teacher.lastName}`, // Added name
    absences: teacher.absences.map((absence) => ({
      lessonDate: absence.lessonDate,
      locationId: absence.locationId,
      subjectId: absence.subjectId,
      lessonPlan: absence.lessonPlan,
    })),
  }));
};

// Function to check for lesson plan updates
const checkLessonPlanUpdates = async () => {
  try {
    // Fetch teachers who haven't updated their lesson plans
    const teachers = await getTeachersWithPendingLessonPlans();

    const today = new Date();

    // Iterate over the teachers and check if any absence is in 2 or 7 days
    for (const teacher of teachers) {
      for (const absence of teacher.absences) {
        const daysUntilLesson = getDifferenceInDays(absence.lessonDate, today);

        // If any absence has a lesson in 2 or 7 days, send an email
        if (daysUntilLesson === 2 || daysUntilLesson === 7) {
          await reminderEmailSend(
            teacher.id,
            teacher.name,
            teacher.email,
            daysUntilLesson
          );
        }
      }
    }
  } catch (error) {
    console.error('Error checking lesson plan updates:', error);
  } finally {
    // Ensure Prisma disconnects after the script finishes
    await prisma.$disconnect();
  }
};

// Execute the function directly when the script runs
checkLessonPlanUpdates();
