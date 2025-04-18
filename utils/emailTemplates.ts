const UPLOAD_LINK = `${process.env.NEXT_PUBLIC_PROD_URL!}/calendar`;

export function createLessonPlanReminderEmailBody(
  user: { firstName: string },
  absence: {
    lessonDate: Date;
    subject: { name: string };
    location: { name: string };
  }
): string {
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedDate = dateFormatter.format(absence.lessonDate);

  return `
    <html>
      <body>
        <p>Hello ${user.firstName},</p>
        <p>
          Please upload your lesson plan for your upcoming absence on
          <strong>${formattedDate}</strong>.
        </p>
        <p>
          <strong>Click the link below to upload:</strong><br/>
          <a href="${UPLOAD_LINK}" target="_blank">Tacet Calendar</a>
        </p>
        <p>Sistema Toronto</p>
      </body>
    </html>
  `;
}

export function createUrgentLessonPlanReminderEmailBody(
  user: { firstName: string },
  absence: {
    lessonDate: Date;
    subject: { name: string };
    location: { name: string };
  }
): string {
  return `
    <html>
      <body>
        <p>Hello ${user.firstName},</p>
        <p>
          Your planned absence in <strong>${absence.subject.name}</strong> at
          <strong>${absence.location.name}</strong> is in 2 business days,
          and we have not received your lesson plan.
        </p>
        <p>
          <strong><span style="color: red;">
            Please upload the lesson plan today.
          </span></strong>
        </p>
        <p>
          <strong>Click the link below to upload:</strong><br/>
          <a href="${UPLOAD_LINK}" target="_blank">Tacet Calendar</a>
        </p>
        <p>Sistema Toronto</p>
      </body>
    </html>
  `;
}
