import { prisma } from '@utils/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { subjects, locations, settings } = body;

    // Validate request data
    if (!subjects && !locations && !settings) {
      return NextResponse.json(
        { error: 'No changes provided' },
        { status: 400 }
      );
    }

    // Use prisma transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Process subject changes
      if (subjects) {
        // Create new subjects
        if (subjects.create && subjects.create.length > 0) {
          for (const subject of subjects.create) {
            // Create the new subject
            const newSubject = await tx.subject.create({
              data: {
                name: subject.name,
                abbreviation: subject.abbreviation,
                colorGroupId: subject.colorGroupId,
              },
            });

            // Get all users to automatically add them to the mailing list for this subject
            const allUsers = await tx.user.findMany({
              select: { id: true },
            });

            // Create MailingList entries for each user with this new subject
            for (const user of allUsers) {
              await tx.mailingList.create({
                data: {
                  userId: user.id,
                  subjectId: newSubject.id,
                },
              });
            }
          }
        }

        // Update existing subjects
        if (subjects.update && subjects.update.length > 0) {
          for (const { id, changes } of subjects.update) {
            await tx.subject.update({
              where: { id },
              data: changes,
            });
          }
        }

        // Delete subjects
        if (subjects.delete && subjects.delete.length > 0) {
          for (const id of subjects.delete) {
            // Check if subject is in use
            const absenceCount = await tx.absence.count({
              where: { subjectId: id },
            });

            if (absenceCount > 0) {
              throw new Error(
                `Cannot delete subject with ID ${id} as it is used in ${absenceCount} absences`
              );
            }

            await tx.subject.delete({
              where: { id },
            });
          }
        }
      }

      // Process location changes
      if (locations) {
        // Create new locations
        if (locations.create && locations.create.length > 0) {
          for (const location of locations.create) {
            await tx.location.create({
              data: {
                name: location.name,
                abbreviation: location.abbreviation,
              },
            });
          }
        }

        // Update existing locations
        if (locations.update && locations.update.length > 0) {
          for (const { id, changes } of locations.update) {
            await tx.location.update({
              where: { id },
              data: changes,
            });
          }
        }

        // Delete locations
        if (locations.delete && locations.delete.length > 0) {
          for (const id of locations.delete) {
            // Check if location is in use
            const absenceCount = await tx.absence.count({
              where: { locationId: id },
            });

            if (absenceCount > 0) {
              throw new Error(
                `Cannot delete location with ID ${id} as it is used in ${absenceCount} absences`
              );
            }

            await tx.location.delete({
              where: { id },
            });
          }
        }
      }

      // Process settings changes
      if (settings && settings.absenceCap !== undefined) {
        // Update the global absence cap setting
        const existingSettings = await tx.globalSettings.findFirst();

        if (existingSettings) {
          // Update existing settings
          await tx.globalSettings.update({
            where: { id: existingSettings.id },
            data: { absenceCap: settings.absenceCap },
          });
        } else {
          // Create new settings if none exist
          await tx.globalSettings.create({
            data: { absenceCap: settings.absenceCap },
          });
        }
      }

      return { success: true };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in batch update:', error);

    // Extract readable error message
    let errorMessage = 'Internal server error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
