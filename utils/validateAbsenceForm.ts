interface AbsenceFormData {
  reasonOfAbsence: string;
  absentTeacherId: string;
  substituteTeacherId: string;
  locationId: string;
  subjectId: string;
  roomNumber: string;
  lessonDate: string;
  notes: string;
}

export function validateAbsenceForm(
  formData: AbsenceFormData
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!formData.absentTeacherId) {
    errors.absentTeacherId = 'Absent teacher ID is required';
  }
  if (!formData.locationId) {
    errors.locationId = 'Location ID is required';
  }
  if (!formData.subjectId) {
    errors.subjectId = 'Subject ID is required';
  }
  if (!formData.reasonOfAbsence) {
    errors.reasonOfAbsence = 'Reason of absence is required';
  }
  if (!formData.lessonDate) {
    errors.lessonDate = 'Date is required';
  }

  return errors;
}
