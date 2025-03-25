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
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { IoSettingsOutline, IoCloseOutline } from 'react-icons/io5';
import { SubjectAPI, Location } from '@utils/types';
import React from 'react';
import SystemChangesConfirmationDialog from './SystemChangesConfirmationDialog';
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
    pendingChanges,
    handleAddChange,
    applyChanges,
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

  const handleClose = () => {
    if (pendingChanges.length > 0) {
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
    if (pendingChanges.length > 0) {
      // Log the pending changes to help debug
      console.log('Pending changes before confirmation:', pendingChanges);
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
      >
        <ModalOverlay />
        <ModalContent
          minHeight={['90vh', '95vh', '100vh']}
          maxHeight="none"
          maxWidth="md"
          position="relative"
          overflow="visible"
        >
          <ModalHeader>
            <HStack justifyContent="space-between" width="100%">
              <HStack>
                <IoSettingsOutline
                  size={20}
                  color={theme.colors.neutralGray[600]}
                />
                <Box>
                  <Text>System Options</Text>
                </Box>
              </HStack>
              <IconButton
                aria-label="Close"
                icon={<IoCloseOutline size={20} />}
                variant="ghost"
                onClick={handleClose}
                size="sm"
              />
            </HStack>
          </ModalHeader>
          <ModalBody
            padding={4}
            flex="1"
            position="relative"
            width="100%"
            overflow="visible"
          >
            <VStack align="stretch" spacing={6} width="100%">
              {/* Subjects Section */}
              <Box>
                <SubjectsTable
                  subjects={updatedSubjects}
                  colorGroups={colorGroups}
                  subjectsInUse={subjectsInUse}
                  handleAddChange={handleAddChange}
                  maxAbbreviationLength={MAX_SUBJECT_ABBREVIATION_LENGTH}
                />
              </Box>

              {/* Locations Section */}
              <Box>
                <LocationsTable
                  locations={updatedLocations}
                  locationsInUse={locationsInUse}
                  handleAddChange={handleAddChange}
                  maxAbbreviationLength={MAX_LOCATION_ABBREVIATION_LENGTH}
                />
              </Box>

              {/* Settings Section */}
              <SystemSettings
                allowedAbsences={updatedAbsenceCap}
                originalAbsenceCap={absenceCap}
                handleAddChange={handleAddChange}
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSave}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <SystemChangesConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={confirmationDialog.onClose}
        onConfirm={isConfirmingClose ? handleCloseConfirmed : applyChanges}
        pendingChanges={pendingChanges}
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
