import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  IconButton,
  useDisclosure,
  useToast,
  useTheme,
  Spacer,
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { IoSettingsOutline, IoCloseOutline } from 'react-icons/io5';
import { SubjectAPI, Location } from '@utils/types';
import React from 'react';
import SystemChangesConfirmationDialog, {
  PendingEntities,
} from './SystemChangesConfirmationDialog';
import SubjectsTable from './SubjectsTable';
import LocationsTable from './LocationsTable';
import SystemSettings from './SystemSettings';
import { useChangeManagement } from '../hooks/useChangeManagement';

interface SystemOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  absenceCap: number;
}

const SystemOptionsModal: React.FC<SystemOptionsModalProps> = ({
  isOpen,
  onClose,
  absenceCap,
}) => {
  // Constants for character limits
  const MAX_SUBJECT_ABBREVIATION_LENGTH = 9;
  const MAX_LOCATION_ABBREVIATION_LENGTH = 12;

  const [subjects, setSubjects] = useState<SubjectAPI[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [subjectsInUse, setSubjectsInUse] = useState<number[]>([]);
  const [locationsInUse, setLocationsInUse] = useState<number[]>([]);
  const confirmationDialog = useDisclosure();
  const toast = useToast();
  const theme = useTheme();
  const [colorGroups, setColorGroups] = useState<
    {
      id: number;
      name: string;
      colorCodes: string[];
    }[]
  >([]);

  const [isConfirmingClose, setIsConfirmingClose] = useState(false);

  const fetchSubjects = useCallback(async () => {
    try {
      const response = await fetch('/api/subjects');
      if (!response.ok) throw new Error('Failed to fetch subjects');
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subjects',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  const fetchLocations = useCallback(async () => {
    try {
      const response = await fetch('/api/locations');
      if (!response.ok) throw new Error('Failed to fetch locations');
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load locations',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  const fetchColorGroups = useCallback(async () => {
    try {
      const response = await fetch('/api/colorGroups');
      if (!response.ok) throw new Error('Failed to fetch color groups');
      const data = await response.json();
      setColorGroups(data);
    } catch (error) {
      console.error('Error fetching color groups:', error);
      toast({
        title: 'Error',
        description: 'Failed to load color groups',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

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
    colorGroups,
    absenceCap,
    onRefresh: refreshData,
    toast,
  });

  // Create a wrapper for applyChanges that also closes the modal
  const applyChanges = async () => {
    try {
      await applyChangesOriginal();
      confirmationDialog.onClose();
      onClose();
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
      setIsConfirmingClose(true);
      confirmationDialog.onOpen();
    } else {
      onClose();
    }
  };

  const handleCloseConfirmed = () => {
    confirmationDialog.onClose();
    setIsConfirmingClose(false);
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
      // Log the pending changes to help debug
      console.log('Pending entities before confirmation:', pendingEntities);
      setIsConfirmingClose(false);
      confirmationDialog.onOpen();
    } else {
      onClose();
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        size="md"
        scrollBehavior="outside"
        isCentered={false}
        motionPreset="slideInBottom"
      >
        <ModalOverlay
          bg="rgba(0, 0, 0, 0.4)"
          backdropFilter="blur(3px)"
          transition="all 0.3s ease"
        />
        <ModalContent
          minHeight={['90vh', '95vh', '100vh']}
          maxHeight="none"
          maxWidth="lg"
          position="relative"
          overflow="visible"
          paddingX="43px"
          paddingY="42px"
          transform={isOpen ? 'translateY(0)' : 'translateY(20px)'}
          opacity={isOpen ? 1 : 0}
          transition="transform 0.3s ease, opacity 0.3s ease"
        >
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
                size="sm"
                transition="background-color 0.2s ease"
              />
            </HStack>
          </ModalHeader>
          <ModalBody
            flex="1"
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
                />
              </Box>

              {/* Settings Section */}
              <SystemSettings
                allowedAbsences={updatedAbsenceCap}
                originalAbsenceCap={absenceCap}
                handleUpdateAbsenceCap={handleUpdateAbsenceCap}
              />
            </VStack>
          </ModalBody>
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
                transition="background-color 0.2s ease"
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
                transition="background-color 0.2s ease"
              >
                Save
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <SystemChangesConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={confirmationDialog.onClose}
        onConfirm={isConfirmingClose ? handleCloseConfirmed : applyChanges}
        pendingEntities={pendingEntities}
        isConfirmingClose={isConfirmingClose}
        subjects={subjects}
        locations={locations}
        colorGroups={colorGroups}
        absenceCap={absenceCap}
      />
    </>
  );
};

export default SystemOptionsModal;
