import { useState } from 'react';
import {
  Box,
  Text,
  Textarea,
  IconButton,
  Button,
  HStack,
  useTheme,
  Spacer,
} from '@chakra-ui/react';
import { FiEdit2 } from 'react-icons/fi';

function EditableNotes({ notes }) {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [savedNotes, setsavedNotes] = useState(notes);
  const [tempNotes, setTempNotes] = useState(notes);

  const handleEditClick = () => {
    setTempNotes(savedNotes);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempNotes(savedNotes);
  };

  const handleSave = () => {
    setsavedNotes(tempNotes);
    setIsEditing(false);
    // TO-DO: edit absence with new notes
  };

  return (
    <Box position="relative">
      <Text textStyle="h4" mb="9px">
        Notes
      </Text>

      {isEditing ? (
        <>
          <Textarea
            value={tempNotes}
            onChange={(e) => setTempNotes(e.target.value)}
            fontSize="12px"
            borderColor={theme.colors.primaryBlue[300]}
            borderRadius="10px"
            padding="15px"
          />

          <HStack mt="20px">
            <Button
              width="143px"
              height="35.174px"
              fontSize="16px"
              fontWeight="500"
              variant="ghost"
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
            >
              Save Changes
            </Button>
          </HStack>
        </>
      ) : (
        <Box
          fontSize="12px"
          padding="15px 15px 33px 15px"
          borderRadius="10px"
          background={theme.colors.neutralGray[50]}
        >
          {savedNotes}
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
