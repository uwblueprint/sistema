import { formatLongDate } from '@utils/dates';

const CALENDAR_URL = `${process.env.NEXT_PUBLIC_PROD_URL!}/calendar`;

export function createLessonPlanReminderEmailBody(
  teacher: { firstName: string; lastName: string },
  absence: {
    lessonDate: Date;
    subject: { name: string };
    location: { name: string };
  }
): string {
  const formattedDate = formatLongDate(absence.lessonDate);

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
          <a href="${CALENDAR_URL}" target="_blank">Tacet Calendar</a>
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
        <p>Hello ${teacher.firstName} ${teacher.lastName},</p>
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
          <a href="${CALENDAR_URL}" target="_blank">Tacet Calendar</a>
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
  const formattedDate = formatLongDate(absence.lessonDate);

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
          <a href="${CALENDAR_URL}" target="_blank">Tacet Calendar</a>
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
  const formattedDate = formatLongDate(absence.lessonDate);

  return `
    <html>
      <body>
        <p>Hello ${fillingTeacher.firstName} ${fillingTeacher.lastName},</p>
        <p>
          This email confirms you have successfully filled
          <strong>${reportingTeacher.firstName} ${reportingTeacher.lastName}</strong>’s
          <strong>${absence.subject.name}</strong> absence from
          <strong>${absence.location.name}</strong> on
          <strong>${formattedDate}</strong>.
        </p>
        <p>
          <strong>Click the link below to view:</strong><br/>
          <a href="${CALENDAR_URL}" target="_blank">Tacet Calendar</a>
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

export function createAbsenceDeletionEmailBody(
  teacher: { firstName: string; lastName: string },
  absence: {
    lessonDate: Date;
    subject: { name: string };
    location: { name: string };
  }
): string {
  const formattedDate = formatLongDate(absence.lessonDate);

  return `
    <html>
      <body>
        <p>
          An absence has been deleted for
          <strong>${teacher.firstName} ${teacher.lastName}’s</strong>
          <strong>${absence.subject.name}</strong> class at
          <strong>${absence.location.name}</strong> on
          <strong>${formattedDate}</strong>.
        </p>
        <p>Sistema Toronto</p>
      </body>
    </html>
  `;
}

export function createUpcomingFilledClassesEmailBody(
  teacher: { firstName: string; lastName: string },
  absences: {
    lessonDate: Date;
    location: { name: string };
    subject: { name: string };
  }[]
): string {
  const sorted = [...absences].sort(
    (a, b) => a.lessonDate.getTime() - b.lessonDate.getTime()
  );

  const itemsHtml = sorted
    .map(({ lessonDate, location, subject }) => {
      const dateStr = formatLongDate(lessonDate);
      return `<li>${dateStr} - ${location.name} - ${subject.name}</li>`;
    })
    .join('');

  return `
    <html>
      <body>
        <p>Hello ${teacher.firstName} ${teacher.lastName},</p>
        <p>You have the following absences coming up in the next 7 business days:</p>
        <ul style="padding-left:1em;">
          ${itemsHtml}
        </ul>
        <p>Sistema Toronto</p>
      </body>
    </html>
  `;
}

export function createLessonPlanUploadedEmailBody(
  declaringTeacher: { firstName: string; lastName: string },
  absence: {
    lessonDate: Date;
    subject: { name: string };
    location: { name: string };
    lessonPlan?: { name: string; url: string } | null;
  }
): string {
  const fullName = `${declaringTeacher.firstName} ${declaringTeacher.lastName}`;
  const formattedDate = formatLongDate(absence.lessonDate);

  return `
    <html>
      <body>
        <p>
          The lesson plan for
          <strong>${fullName}’s ${absence.subject.name}</strong>
          absence from
          <strong>${absence.location.name}</strong> on
          <strong>${formattedDate}</strong>
          has been uploaded.
        </p>
        <p>
          <strong>Click the link below to view:</strong><br/>
          <a href="${CALENDAR_URL}" target="_blank">Tacet Calendar</a>
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
      </body>
    </html>
  `;
}

export function createUpcomingFilledClassReminderEmailBody(
  teacher: { firstName: string; lastName: string },
  absence: {
    lessonDate: Date;
    subject: { name: string };
    location: { name: string };
  }
): string {
  const formattedDate = formatLongDate(absence.lessonDate);

  return `
    <html>
      <body>
        <p>Hello ${teacher.firstName} ${teacher.lastName},</p>
        <p>
          This is a reminder that you have filled the following class:
        </p>
        <p>
          <strong>${formattedDate}</strong> — 
          <strong>${absence.location.name}</strong> — 
          <strong>${absence.subject.name}</strong>
        </p>
        <p>
          <strong>Click the link below to view details:</strong><br/>
          <a href="${CALENDAR_URL}" target="_blank">Tacet Calendar</a>
        </p>
        <p>Sistema Toronto</p>
      </body>
    </html>
  `;
}

export function createUpcomingUnfilledAbsencesEmailBody(
  teacher: { firstName: string; lastName: string },
  absences: {
    lessonDate: Date;
    subject: { name: string };
    location: { name: string };
  }[]
): string {
  const sorted = [...absences].sort(
    (a, b) => a.lessonDate.getTime() - b.lessonDate.getTime()
  );

  const itemsHtml = sorted
    .map(({ lessonDate, location, subject }) => {
      const dateStr = formatLongDate(lessonDate);
      return `<li><strong>${dateStr}</strong> - ${location.name} - ${subject.name}</li>`;
    })
    .join('');

  return `
    <html>
      <body>
        <p>Hello ${teacher.firstName} ${teacher.lastName},</p>
        <p>
          The following classes in the next <strong>3 business days</strong> are still unfilled:
        </p>
        <ul style="padding-left:1em;">
          ${itemsHtml}
        </ul>
        <p>
          Please help us run a smooth program by filling any of these classes if you’re able to.
        </p>
        <p>
          <strong>Click below to view and fill:</strong><br/>
          <a href="${CALENDAR_URL}" target="_blank">Tacet Calendar</a>
        </p>
        <p>Sistema Toronto</p>
      </body>
    </html>
  `;
}

export function createUrgentAbsenceEmailBody(absence: {
  lessonDate: Date;
  subject: { name: string };
  location: { name: string };
  lessonPlan?: { name: string; url: string } | null;
}): string {
  const formattedDate = formatLongDate(absence.lessonDate);

  return `
    <html>
      <body>
        <p><strong>Attention teachers</strong>,</p>
        <p>The following unfilled absence is coming up very soon:</p>
        <p>
          <strong>Date:</strong> ${formattedDate}<br/>
          <strong>Location:</strong> ${absence.location.name}<br/>
          <strong>Class:</strong> ${absence.subject.name}
        </p>
        <p>
          <strong>Click the link below to fill:</strong><br/>
          <a href="${CALENDAR_URL}" target="_blank">Tacet Calendar</a>
        </p>
        ${
          absence.lessonPlan
            ? `<p>
                 <strong>Lesson Plan (attached):</strong><br/>
                 <a href="${absence.lessonPlan.url}" target="_blank">
                   ${absence.lessonPlan.name}
                 </a>
               </p>`
            : ``
        }
        <p>
          Please help us run a smooth program and fill this class if you are able to.
        </p>
        <p>Sistema Toronto</p>
      </body>
    </html>
  `;
}

export function createNonUrgentAbsenceEmailBody(absence: {
  lessonDate: Date;
  subject: { name: string };
  location: { name: string };
  lessonPlan?: { name: string; url: string } | null;
}): string {
  const formattedDate = formatLongDate(absence.lessonDate);

  return `
    <html>
      <body>
        <p><strong>Sistema Toronto Tacet — New absence available to fill</strong></p>
        <p>A new absence has been declared:</p>
        <p>
          <strong>Date:</strong> ${formattedDate}<br/>
          <strong>Location:</strong> ${absence.location.name}<br/>
          <strong>Class:</strong> ${absence.subject.name}
        </p>
        <p>
          <strong>Click the link below to fill:</strong><br/>
          <a href="${CALENDAR_URL}" target="_blank">Tacet Calendar</a>
        </p>
        ${
          absence.lessonPlan
            ? `<p>
                <strong>Lesson Plan (attached):</strong><br/>
                <a href="${absence.lessonPlan.url}" target="_blank">
                  ${absence.lessonPlan.name}
                </a>
              </p>`
            : ''
        }
        <p>
          Please help us run a smooth program and fill this class if you are able to.
        </p>
        <p>Sistema Toronto</p>
      </body>
    </html>
  `;
}

interface AbsenceInfo {
  lessonDate: Date;
  subject: { name: string };
  location: { name: string };
  lessonPlan?: { name: string; url: string } | null;
}

export function createDailyDeclarationDigestEmailBody(
  teacher: { firstName: string; lastName: string },
  urgentAbsences: AbsenceInfo[],
  nonUrgentAbsences: AbsenceInfo[]
): string {
  const grouped: Record<string, AbsenceInfo[]> = {};
  nonUrgentAbsences.forEach((a) => {
    const key = a.subject.name;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(a);
  });

  const renderAbsenceItem = (a: AbsenceInfo) => {
    const dateStr = formatLongDate(a.lessonDate);
    const planLink = a.lessonPlan
      ? `<br/>Lesson Plan: <a href="${a.lessonPlan.url}" target="_blank">${a.lessonPlan.name}</a>`
      : '';
    return `<li>${dateStr} - ${a.location.name} - ${a.subject.name}${planLink}</li>`;
  };

  const urgentHtml = urgentAbsences.length
    ? `
      <p style="color:red;"><strong>Urgent Absences (≤ 7 days away):</strong></p>
      <ul style="padding-left:1em;">
        ${urgentAbsences.map(renderAbsenceItem).join('')}
      </ul>`
    : '';

  const nonUrgentHtml = Object.entries(grouped)
    .map(
      ([subjectName, list]) => `
      <p><strong>${subjectName}</strong></p>
      <ul style="padding-left:1em;">
        ${list.map(renderAbsenceItem).join('')}
      </ul>`
    )
    .join('');

  return `
    <html>
      <body>
        <p>Hello ${teacher.firstName} ${teacher.lastName},</p>
        <p>Here are the upcoming unfilled absences declared in the past 24 hours:</p>
        ${urgentHtml}
        ${nonUrgentHtml}
        <p>
          <strong>Click below to fill or view details:</strong><br/>
          <a href="${CALENDAR_URL}" target="_blank">Tacet Calendar</a>
        </p>
        <p>Sistema Toronto</p>
      </body>
    </html>
  `;
}
