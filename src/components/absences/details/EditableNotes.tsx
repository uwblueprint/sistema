import {
  Box,
  Button,
  HStack,
  IconButton,
  Spacer,
  Text,
  Textarea,
  useTheme,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import { useCustomToast } from '../../CustomToast';
import { EditIcon } from '../modals/edit/EditAbsenceForm';

interface EditableNotesProps {
  notes: string;
  absenceId: number;
  fetchAbsences: () => Promise<void>;
}

function EditableNotes({
  notes,
  absenceId,
  fetchAbsences,
}: EditableNotesProps) {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [savedNotes, setSavedNotes] = useState(notes);
  const [tempNotes, setTempNotes] = useState(notes);
  const [isSaving, setIsSaving] = useState(false);
  const noteBoxRef = useRef<HTMLDivElement | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const [initialHeight, setInitialHeight] = useState<number | undefined>(
    undefined
  );
  const showToast = useCustomToast();

  const emptyNotesSpace = 41;
  const spaceAfterNotes = 33;
  const minHeight = emptyNotesSpace + spaceAfterNotes;

  const handleEditClick = () => {
    const height = noteBoxRef.current?.offsetHeight ?? minHeight;
    setInitialHeight(Math.max(height, minHeight));
    setTempNotes(savedNotes);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempNotes(savedNotes);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const saveRes = await fetch('/api/editAbsence', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: absenceId,
          notes: tempNotes || null,
        }),
      });
      if (!saveRes.ok) throw new Error('Failed to save notes');

      const emailRes = await fetch('/api/emails/editAbsence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ absenceId }),
      });
      if (!emailRes.ok) {
        const err = await emailRes.json();
        throw new Error(err.error || 'Failed to send confirmation emails');
      }

      setSavedNotes(tempNotes);
      setIsEditing(false);

      showToast({
        status: 'success',
        description: 'Notes saved and confirmation emails sent.',
        icon: <EditIcon bg="positiveGreen.200" />,
      });
    } catch (error: any) {
      const errorMessage = error.message
        ? `Error saving notes and sending confirmation emails: ${error.message}`
        : 'Error saving notes and sending confirmation emails.';
      showToast({
        status: 'error',
        description: errorMessage,
        icon: <EditIcon bg="errorRed.200" />,
      });
    } finally {
      setIsSaving(false);
      fetchAbsences();
    }
  };

  useEffect(() => {
    if (isEditing && textAreaRef.current) {
      const textLength = textAreaRef.current.value.length;
      textAreaRef.current.setSelectionRange(textLength, textLength);
    }
  }, [isEditing]);

  return (
    <Box position="relative">
      <Text textStyle="h4" mb="9px">
        Notes
      </Text>

      {isEditing ? (
        <>
          <Textarea
            ref={textAreaRef}
            value={tempNotes}
            onChange={(e) => setTempNotes(e.target.value)}
            fontSize="12px"
            borderColor={theme.colors.primaryBlue[300]}
            borderRadius="10px"
            padding="15px"
            minH={`${initialHeight}px`}
          />
          <HStack mt="20px" mb="9px">
            <Button
              width="143px"
              height="35.174px"
              fontSize="16px"
              fontWeight="500"
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Spacer />
            <Button
              width="143px"
              height="35.174px"
              fontSize="16px"
              fontWeight="500"
              onClick={handleSave}
              isLoading={isSaving}
              loadingText="Saving"
            >
              Save Changes
            </Button>
          </HStack>
        </>
      ) : (
        <Box
          ref={noteBoxRef}
          fontSize="12px"
          padding="15px 15px 33px 15px"
          borderRadius="10px"
          background={theme.colors.neutralGray[50]}
        >
          {savedNotes || ''}
          <IconButton
            aria-label="Edit Notes"
            icon={<FiEdit2 size="15px" color={theme.colors.neutralGray[600]} />}
            size="sm"
            variant="ghost"
            position="absolute"
            bottom="8px"
            right="16px"
            onClick={handleEditClick}
          />
        </Box>
      )}
    </Box>
  );
}

export default EditableNotes;
