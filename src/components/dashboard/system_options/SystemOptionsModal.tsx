import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Text,
  useDisclosure,
  useTheme,
  VStack,
} from '@chakra-ui/react';
import {
  MAX_LOCATION_ABBREVIATION_LENGTH,
  MAX_SUBJECT_ABBREVIATION_LENGTH,
} from '@utils/consts';
import { Location, SubjectAPI } from '@utils/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { IoCloseOutline, IoSettingsOutline } from 'react-icons/io5';
import { useChangeManagement } from '../../../../hooks/useChangeManagement';
import { useCustomToast } from '../../CustomToast';
import LocationsTable from './LocationsTable';
import SubjectsTable from './SubjectsTable';
import SystemChangesConfirmationModal from './SystemChangesConfirmationModal';
import SystemSettings from './SystemSettings';
import UnsavedChangesModal from './UnsavedChangesModal';

interface SystemOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  absenceCap: number;
  onUpdateComplete?: () => void;
}

const SystemOptionsModal: React.FC<SystemOptionsModalProps> = ({
  isOpen,
  onClose,
  absenceCap,
  onUpdateComplete,
}) => {
  const [subjects, setSubjects] = useState<SubjectAPI[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [subjectsInUse, setSubjectsInUse] = useState<number[]>([]);
  const [locationsInUse, setLocationsInUse] = useState<number[]>([]);
  const confirmationModal = useDisclosure();
  const unsavedChangesModal = useDisclosure();
  const toastRef = useRef(useCustomToast());
  const theme = useTheme();

  // Default color group to ensure we always have at least one color group
  // for the preview object in EntityTable.tsx
  // This will be replaced with the actual color group from the API
  const defaultColorGroup = {
    id: 0,
    name: 'Default',
    colorCodes: ['#000000', '#1E88E5', '#64B5F6', '#E3F2FD'],
  };

  const [colorGroups, setColorGroups] = useState<
    {
      id: number;
      name: string;
      colorCodes: string[];
    }[]
  >([defaultColorGroup]);

  const fetchSubjects = useCallback(async () => {
    try {
      const response = await fetch('/api/subjects');

      if (!response.ok) {
        let errorMessage = 'Failed to load subjects: ';
        try {
          const errorData = await response.json();
          errorMessage +=
            errorData?.error || response.statusText || 'Unknown error';
        } catch {
          errorMessage += response.statusText || 'Unknown error';
        }
        console.error(errorMessage);
        toastRef.current({ description: errorMessage, status: 'error' });
        return;
      }

      const data = await response.json();
      setSubjects(data);
    } catch (error: any) {
      const errorMessage = error?.message
        ? `Failed to load subjects: ${error.message}`
        : 'Failed to load subjects.';
      console.error(errorMessage, error);

      toastRef.current({ description: errorMessage, status: 'error' });
    }
  }, []);

  const fetchLocations = useCallback(async () => {
    try {
      const response = await fetch('/api/locations');
      if (!response.ok) {
        let errorMessage = 'Failed to load locations: ';
        try {
          const errorData = await response.json();
          errorMessage +=
            errorData?.error || response.statusText || 'Unknown error';
        } catch {
          errorMessage += response.statusText || 'Unknown error';
        }
        console.error(errorMessage);
        toastRef.current({ description: errorMessage, status: 'error' });
        return;
      }
      const data = await response.json();
      setLocations(data);
    } catch (error: any) {
      const errorMessage = error?.message
        ? `Failed to load locations: ${error.message}`
        : 'Failed to load locations.';
      console.error(errorMessage, error);
      toastRef.current({ description: errorMessage, status: 'error' });
    }
  }, []);

  const fetchColorGroups = useCallback(async () => {
    try {
      const response = await fetch('/api/colorGroups');
      if (!response.ok) {
        let errorMessage = 'Failed to load color groups: ';
        try {
          const errorData = await response.json();
          errorMessage +=
            errorData?.error || response.statusText || 'Unknown error';
        } catch {
          errorMessage += response.statusText || 'Unknown error';
        }
        console.error(errorMessage);
        toastRef.current({ description: errorMessage, status: 'error' });
        return;
      }
      const data = await response.json();
      setColorGroups(data);
    } catch (error: any) {
      const errorMessage = error?.message
        ? `Failed to load color groups: ${error.message}`
        : 'Failed to load color groups.';
      console.error(errorMessage, error);
      toastRef.current({ description: errorMessage, status: 'error' });
    }
  }, []);

  const checkSubjectsInUse = useCallback(async () => {
    try {
      const response = await fetch('/api/subjects/inUse');
      if (!response.ok) {
        let errorMessage = 'Failed to check subjects in use: ';
        try {
          const errorData = await response.json();
          errorMessage +=
            errorData?.error || response.statusText || 'Unknown error';
        } catch {
          errorMessage += response.statusText || 'Unknown error';
        }
        console.error(errorMessage);
        toastRef.current({ description: errorMessage, status: 'error' });
        return;
      }
      const data = await response.json();
      setSubjectsInUse(data.subjectsInUse || []);
    } catch (error: any) {
      const errorMessage = error?.message
        ? `Failed to check subjects in use: ${error.message}`
        : 'Failed to check subjects in use.';
      console.error(errorMessage, error);
      toastRef.current({ description: errorMessage, status: 'error' });
    }
  }, []);

  const checkLocationsInUse = useCallback(async () => {
    try {
      const response = await fetch('/api/locations/inUse');
      if (!response.ok) {
        let errorMessage = 'Failed to check locations in use: ';
        try {
          const errorData = await response.json();
          errorMessage +=
            errorData?.error || response.statusText || 'Unknown error';
        } catch {
          errorMessage += response.statusText || 'Unknown error';
        }
        console.error(errorMessage);
        toastRef.current({ description: errorMessage, status: 'error' });
        return;
      }
      const data = await response.json();
      setLocationsInUse(data.locationsInUse || []);
    } catch (error: any) {
      const errorMessage = error?.message
        ? `Failed to check locations in use: ${error.message}`
        : 'Failed to check locations in use.';
      console.error(errorMessage, error);
      toastRef.current({ description: errorMessage, status: 'error' });
    }
  }, []);

  const refreshData = useCallback(() => {
    fetchSubjects();
    fetchLocations();
  }, [fetchSubjects, fetchLocations]);

  useEffect(() => {
    if (isOpen) {
      fetchSubjects();
      fetchLocations();
      fetchColorGroups();
      checkSubjectsInUse();
      checkLocationsInUse();
    }
  }, [
    isOpen,
    fetchSubjects,
    fetchLocations,
    fetchColorGroups,
    checkSubjectsInUse,
    checkLocationsInUse,
    absenceCap,
  ]);

  // Use our change management hook
  const {
    pendingEntities,
    handleUpdateSubject,
    handleUpdateLocation,
    handleUpdateAbsenceCap,
    applyChanges: applyChangesOriginal,
    clearChanges,
    updatedSubjects,
    updatedLocations,
    updatedAbsenceCap,
  } = useChangeManagement({
    subjects,
    locations,
    absenceCap,
    onRefresh: refreshData,
  });

  // Create a wrapper for applyChanges that also closes the modal
  const applyChanges = async () => {
    try {
      const result = await applyChangesOriginal();
      if (result) {
        if (onUpdateComplete) {
          onUpdateComplete();
        }
        confirmationModal.onClose();
        onClose();
      }
    } catch (error: any) {
      const errorMessage = error?.message
        ? `Failed to apply changes: ${error.message}`
        : 'Failed to apply changes.';
      console.error(errorMessage, error);

      toastRef.current({
        status: 'error',
        description: errorMessage,
      });
    }
  };

  const handleClose = () => {
    // Check if there are any pending changes
    const hasChanges =
      pendingEntities.subjects.size > 0 ||
      pendingEntities.locations.size > 0 ||
      pendingEntities.settings.absenceCap !== undefined;

    if (hasChanges) {
      unsavedChangesModal.onOpen();
    } else {
      onClose();
    }
  };

  const handleCloseConfirmed = () => {
    unsavedChangesModal.onClose();
    // Clear any pending changes
    clearChanges();
    onClose();
  };

  const handleSave = () => {
    // Check if there are any pending changes
    const hasChanges =
      pendingEntities.subjects.size > 0 ||
      pendingEntities.locations.size > 0 ||
      pendingEntities.settings.absenceCap !== undefined;

    if (hasChanges) {
      confirmationModal.onOpen();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      scrollBehavior="outside"
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="rgba(0, 0, 0, 0.4)" zIndex={1502} />
      <ModalContent
        width="510px"
        maxWidth="510px"
        paddingX="43px"
        paddingY="42px"
        containerProps={{
          zIndex: '1502',
        }}
      >
        <Flex direction="column" width="100%">
          <ModalHeader padding={0}>
            <HStack spacing={0} width="100%">
              <IoSettingsOutline
                size={29}
                color={theme.colors.neutralGray[600]}
              />
              <Box width="16px" />
              <Box>
                <Text textStyle="h2">System Options</Text>
              </Box>
              <Spacer />
              <IconButton
                aria-label="Close"
                icon={<IoCloseOutline size={40} />}
                variant="ghost"
                onClick={handleClose}
              />
            </HStack>
          </ModalHeader>
          <ModalBody
            position="relative"
            width="100%"
            overflow="visible"
            padding={0}
          >
            <VStack
              align="stretch"
              spacing="37px"
              width="100%"
              marginTop="37px"
            >
              {/* Subjects Section */}
              <Box>
                <SubjectsTable
                  subjects={updatedSubjects}
                  colorGroups={colorGroups}
                  subjectsInUse={subjectsInUse}
                  handleUpdateSubject={handleUpdateSubject}
                  maxAbbreviationLength={MAX_SUBJECT_ABBREVIATION_LENGTH}
                />
              </Box>

              {/* Locations Section */}
              <Box>
                <LocationsTable
                  locations={updatedLocations}
                  locationsInUse={locationsInUse}
                  handleUpdateLocation={handleUpdateLocation}
                  maxAbbreviationLength={MAX_LOCATION_ABBREVIATION_LENGTH}
                  colorGroups={colorGroups}
                />
              </Box>

              {/* Settings Section */}
              <Box>
                <SystemSettings
                  allowedAbsences={updatedAbsenceCap}
                  originalAbsenceCap={absenceCap}
                  handleUpdateAbsenceCap={handleUpdateAbsenceCap}
                />
              </Box>
            </VStack>
          </ModalBody>

          {/* SystemChangesConfirmationModal */}
          <SystemChangesConfirmationModal
            isOpen={confirmationModal.isOpen}
            onClose={confirmationModal.onClose}
            onConfirm={applyChanges}
            pendingEntities={pendingEntities}
            subjects={subjects}
            locations={locations}
            colorGroups={colorGroups}
            absenceCap={absenceCap}
          />

          {/* UnsavedChangesModal for confirming closing with unsaved changes */}
          <UnsavedChangesModal
            isOpen={unsavedChangesModal.isOpen}
            onClose={unsavedChangesModal.onClose}
            onConfirm={handleCloseConfirmed}
          />

          <ModalFooter width="100%" padding={0} marginTop="37px">
            <HStack spacing={4} width="100%">
              <Button
                variant="outline"
                size="lg"
                flex="1"
                height="35px"
                borderRadius="md"
                textStyle="button"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                size="lg"
                flex="1"
                height="35px"
                borderRadius="md"
                textStyle="button"
                onClick={handleSave}
              >
                Save
              </Button>
            </HStack>
          </ModalFooter>
        </Flex>
      </ModalContent>
    </Modal>
  );
};

export default SystemOptionsModal;
