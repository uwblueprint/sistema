import { Prisma } from '@prisma/client';
import { uploadFile } from './uploadFile';

type SubmitAbsenceBase = {
  formData: any;
  lessonPlan: File | null;
};

type DeclareAbsenceParams = SubmitAbsenceBase & {
  onDeclareAbsence: (absence: Prisma.AbsenceCreateManyInput) => Promise<any>;
  onEditAbsence?: never;
};

type EditAbsenceParams = SubmitAbsenceBase & {
  onEditAbsence: (
    absence: Partial<Prisma.AbsenceUpdateInput> & { id: number }
  ) => Promise<any>;
  onDeclareAbsence?: never;
};

type SubmitAbsenceParams = DeclareAbsenceParams | EditAbsenceParams;

export async function submitAbsence({
  formData,
  lessonPlan,
  onDeclareAbsence,
  onEditAbsence,
}: SubmitAbsenceParams): Promise<boolean> {
  const lessonDate = new Date(formData.lessonDate + 'T00:00:00');

  let lessonPlanData: { url: string; name: string; size: number } | null = null;
  if (lessonPlan) {
    const lessonPlanUrl = await uploadFile(lessonPlan);
    if (!lessonPlanUrl) return false;

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

  if (onEditAbsence && formData.id) {
    return await onEditAbsence({ ...absenceData, id: formData.id });
  }

  if (onDeclareAbsence) {
    const response = await onDeclareAbsence(absenceData);
    return Boolean(response);
  }

  throw new Error('submitAbsence called without a valid action handler');
}
