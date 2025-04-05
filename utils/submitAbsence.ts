import { Prisma } from '@prisma/client';
import { uploadFile } from './uploadFile';

interface SubmitAbsenceParams {
  formData: any;
  lessonPlan: File | null;
  onDeclareAbsence: (absence: Prisma.AbsenceCreateManyInput) => Promise<any>;
}

export async function submitAbsence({
  formData,
  lessonPlan,
  onDeclareAbsence,
}: SubmitAbsenceParams): Promise<{ success: boolean; message: string }> {
  const lessonDate = new Date(formData.lessonDate + 'T00:00:00');

  let lessonPlanData: { url: string; name: string; size: number } | null = null;
  if (lessonPlan) {
    const lessonPlanUrl = await uploadFile(lessonPlan);
    if (!lessonPlanUrl) {
      return {
        success: false,
        message: 'Failed to upload the lesson plan file',
      };
    }
    lessonPlanData = {
      url: lessonPlanUrl,
      name: lessonPlan.name,
      size: lessonPlan.size,
    };
  }

  const absenceData = {
    lessonDate,
    reasonOfAbsence: formData.reasonOfAbsence,
    absentTeacherId: parseInt(formData.absentTeacherId, 10),
    substituteTeacherId: formData.substituteTeacherId
      ? parseInt(formData.substituteTeacherId, 10)
      : null,
    locationId: parseInt(formData.locationId, 10),
    subjectId: parseInt(formData.subjectId, 10),
    notes: formData.notes,
    roomNumber: formData.roomNumber || null,
    lessonPlanFile: lessonPlanData,
  };

  const response = await onDeclareAbsence(absenceData);
  if (response) {
    return {
      success: true,
      message: lessonDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
    };
  }

  return { success: false, message: 'Failed to declare absence' };
}
