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
      if (!response.ok) throw new Error('Failed to fetch subjects');
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toastRef.current({
        description: 'Failed to load subjects',
        status: 'error',
      });
    }
  }, []);

  const fetchLocations = useCallback(async () => {
    try {
      const response = await fetch('/api/locations');
      if (!response.ok) throw new Error('Failed to fetch locations');
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toastRef.current({
        description: 'Failed to load locations',
        status: 'error',
      });
    }
  }, []);

  const fetchColorGroups = useCallback(async () => {
    try {
      const response = await fetch('/api/colorGroups');
      if (!response.ok) throw new Error('Failed to fetch color groups');
      const data = await response.json();
      setColorGroups(data);
    } catch (error) {
      console.error('Error fetching color groups:', error);
      toastRef.current({
        description: 'Failed to load color groups',
        status: 'error',
      });
    }
  }, []);

  const checkSubjectsInUse = useCallback(async () => {
    try {
      const response = await fetch('/api/subjects/inUse');
      if (!response.ok) throw new Error('Failed to check subjects in use');
      const data = await response.json();
      setSubjectsInUse(data.subjectsInUse || []);
    } catch (error) {
      console.error('Error checking subjects in use:', error);
    }
  }, []);

  const checkLocationsInUse = useCallback(async () => {
    try {
      const response = await fetch('/api/locations/inUse');
      if (!response.ok) throw new Error('Failed to check locations in use');
      const data = await response.json();
      setLocationsInUse(data.locationsInUse || []);
    } catch (error) {
      console.error('Error checking locations in use:', error);
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
        // Call the callback to notify parent components that changes have been applied
        if (onUpdateComplete) {
          onUpdateComplete();
        }

        confirmationModal.onClose();
        onClose();
      }
    } catch (error) {
      console.error('Error applying changes:', error);
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
      <ModalOverlay bg="rgba(0, 0, 0, 0.4)" />
      <ModalContent
        width="510px"
        maxWidth="510px"
        paddingX="43px"
        paddingY="42px"
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
