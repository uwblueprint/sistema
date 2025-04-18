const UPLOAD_LINK = `${process.env.NEXT_PUBLIC_PROD_URL!}/calendar`;

export function createLessonPlanReminderEmailBody(
  teacher: { firstName: string; lastName: string },
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
        <p>Hello ${teacher.firstName} ${teacher.lastName},</p>
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
  teacher: { firstName: string; lastName: string },
  absence: {
    lessonDate: Date;
    subject: { name: string };
    location: { name: string };
  }
): string {
  return `
    <html>
      <body>
        <p>Hello ${teacher.firstName}  ${teacher.lastName},</p>
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

export function createAbsenceModificationEmailBody(
  teacher: { firstName: string; lastName: string },
  absence: {
    lessonDate: Date;
    subject: { name: string };
    location: { name: string };
    lessonPlan?: { name: string; url: string } | null;
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
        <p>Hello,</p>
        <p>
          A modification has been made to
          <strong>${teacher.firstName} ${teacher.lastName}’s</strong>
          <strong>${absence.subject.name}</strong> absence from
          <strong>${absence.location.name}</strong> on
          <strong>${formattedDate}</strong>.
        </p>
        <p>
          <strong>Click the link below to view:</strong><br/>
          <a href="${UPLOAD_LINK}" target="_blank">Tacet Calendar</a>
        </p>
        ${
          absence.lessonPlan
            ? `<p>
                <strong>Lesson Plan:</strong><br/>
                <a href="${absence.lessonPlan.url}" target="_blank">
                  ${absence.lessonPlan.name}
                </a>
               </p>`
            : ``
        }
        <p>Sistema Toronto</p>
      </body>
    </html>
  `;
}

export function createAbsenceFillConfirmationEmailBody(
  fillingTeacher: { firstName: string; lastName: string },
  reportingTeacher: { firstName: string; lastName: string },
  absence: {
    lessonDate: Date;
    subject: { name: string };
    location: { name: string };
    lessonPlan?: { name: string; url: string } | null;
  }
): string {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(absence.lessonDate);

  return `
    <html>
      <body>
        <p>Hello ${fillingTeacher.firstName} ${fillingTeacher.lastName},</p>
        <p>
          This email confirms you have successfully filled
          <strong>${reportingTeacher.firstName} ${reportingTeacher.lastName}’s</strong>
          <strong>${absence.subject.name}</strong> absence from
          <strong>${absence.location.name}</strong> on
          <strong>${formattedDate}</strong>.
        </p>
        <p>
          <strong>Click the link below to view:</strong><br/>
          <a href="${UPLOAD_LINK}" target="_blank">Tacet Calendar</a>
        </p>
        ${
          absence.lessonPlan
            ? `<p>
                 <strong>Lesson Plan:</strong><br/>
                 <a href="${absence.lessonPlan.url}" target="_blank">
                   ${absence.lessonPlan.name}
                 </a>
               </p>`
            : ``
        }
        <p>Sistema Toronto</p>
      </body>
    </html>
  `;
}
