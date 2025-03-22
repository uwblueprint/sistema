import React, { useRef, useState } from 'react';
import {
  Box,
  Text,
  HStack,
  Button,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tooltip,
  useTheme,
} from '@chakra-ui/react';
import {
  IoEllipsisHorizontal,
  IoCreateOutline,
  IoArchiveOutline,
  IoTrashOutline,
  IoAdd,
  IoCheckmark,
  IoCloseOutline,
  IoBookOutline,
} from 'react-icons/io5';
import { FiType } from 'react-icons/fi';
import { LuInfo, LuArchive } from 'react-icons/lu';
import { Location } from '@utils/types';
import { Change } from './SystemChangesConfirmationDialog';

interface LocationsTableProps {
  locations: Location[];
  locationsInUse: number[];
  handleAddChange: (change: Change) => void;
  maxAbbreviationLength: number;
}

const LocationsTable: React.FC<LocationsTableProps> = ({
  locations,
  locationsInUse,
  handleAddChange,
  maxAbbreviationLength,
}) => {
  const theme = useTheme();
  const editingRowRef = useRef<HTMLDivElement>(null);

  const [editingLocation, setEditingLocation] = useState<{
    id: number | null;
    name: string;
    abbreviation: string;
  } | null>(null);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [newLocation, setNewLocation] = useState<Location>({
    id: 0,
    name: '',
    abbreviation: '',
    archived: false,
  });

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
  };

  const handleSaveEditedLocation = () => {
    if (
      !editingLocation ||
      !editingLocation.name ||
      !editingLocation.abbreviation
    )
      return;

    // Validate abbreviation length
    if (editingLocation.abbreviation.length > maxAbbreviationLength) {
      // You'd need to add toast handling here or pass a callback
      return;
    }

    // Store the current editing state
    const currentEditingLocation = { ...editingLocation };

    // Reset the editing state first
    setEditingLocation(null);

    // Find the original location to compare changes
    const originalLocation = locations.find(
      (l) => l.id === currentEditingLocation.id
    );
    if (!originalLocation) return;

    // Only include fields that have changed
    const changedData: any = {};

    if (originalLocation.name !== currentEditingLocation.name) {
      changedData.name = currentEditingLocation.name;
      // Store original name for change history
      changedData.originalName = originalLocation.name;
    }

    if (originalLocation.abbreviation !== currentEditingLocation.abbreviation) {
      changedData.abbreviation = currentEditingLocation.abbreviation;
      // Store original abbreviation for change history
      changedData.originalAbbreviation = originalLocation.abbreviation;
    }

    // Only proceed if there are actual changes
    if (Object.keys(changedData).length > 0) {
      // Check if all values being changed are actually the same as original values
      const allChangesReverted =
        (changedData.name === undefined ||
          changedData.name === changedData.originalName) &&
        (changedData.abbreviation === undefined ||
          changedData.abbreviation === changedData.originalAbbreviation);

      // Only add the change if something is actually different
      if (!allChangesReverted) {
        handleAddChange({
          type: 'update',
          entity: 'location',
          id: currentEditingLocation.id!,
          data: changedData,
          displayText: `Updated Location "${currentEditingLocation.name}"`,
        });
      }
    }
  };

  const handleAddLocation = () => {
    if (!newLocation.name || !newLocation.abbreviation) return;

    // Validate abbreviation length
    if (newLocation.abbreviation.length > maxAbbreviationLength) {
      // You'd need to add toast handling here or pass a callback
      return;
    }

    // Create a temporary ID for the new location (negative to avoid conflicts)
    const tempId = -Date.now();

    handleAddChange({
      type: 'add',
      entity: 'location',
      id: tempId,
      data: {
        name: newLocation.name,
        abbreviation: newLocation.abbreviation,
      },
      displayText: `Added Location "${newLocation.name}"`,
    });

    setIsAddingLocation(false);
    setNewLocation({
      id: 0,
      name: '',
      abbreviation: '',
      archived: false,
    });
  };

  const handleCancelEdit = () => {
    setEditingLocation(null);
    setIsAddingLocation(false);
  };

  const handleArchiveLocation = (location: Location) => {
    handleAddChange({
      type: location.archived ? 'unarchive' : 'archive',
      entity: 'location',
      id: location.id,
      data: { archived: !location.archived },
      displayText: `${location.archived ? 'Unarchived' : 'Archived'} Location "${location.name}"`,
    });
  };

  const handleDeleteLocation = (location: Location) => {
    handleAddChange({
      type: 'delete',
      entity: 'location',
      id: location.id,
      displayText: `Deleted Location "${location.name}"`,
    });
  };

  return (
    <Box borderWidth="1px" borderRadius="md" overflow="hidden">
      {/* Table Header */}
      <Box
        p={3}
        bg="gray.50"
        borderBottomWidth="1px"
        display="flex"
        width="100%"
      >
        <Box width="70%" pl={2}>
          <HStack spacing={1}>
            <IoBookOutline />
            <Text fontWeight="medium">Location</Text>
            <Box
              as="span"
              ml={1}
              color="primaryBlue.300"
              cursor="help"
              position="relative"
              _hover={{
                '& > div': {
                  display: 'block',
                },
              }}
            >
              <LuInfo />
              <Box
                display="none"
                position="absolute"
                bg="gray.700"
                color="white"
                p={2}
                borderRadius="md"
                fontSize="sm"
                zIndex={10}
                top="100%"
                left="50%"
                transform="translateX(-50%)"
                width="150px"
                textAlign="center"
              >
                The full location name
              </Box>
            </Box>
          </HStack>
        </Box>
        <Box width="30%">
          <HStack spacing={1}>
            <FiType />
            <Text fontWeight="medium">Display</Text>
            <Box
              as="span"
              ml={1}
              color="primaryBlue.300"
              cursor="help"
              position="relative"
              _hover={{
                '& > div': {
                  display: 'block',
                },
              }}
            >
              <LuInfo />
              <Box
                display="none"
                position="absolute"
                bg="gray.700"
                color="white"
                p={2}
                borderRadius="md"
                fontSize="sm"
                zIndex={10}
                top="100%"
                right="0"
                width="200px"
                textAlign="center"
              >
                The abbreviated location name
                <br />
                (max {maxAbbreviationLength} characters)
              </Box>
            </Box>
          </HStack>
        </Box>
      </Box>

      {/* Table Rows */}
      {locations.map((location) => (
        <Box
          p={3}
          borderBottomWidth="1px"
          _last={{ borderBottomWidth: 0 }}
          ref={editingLocation?.id === location.id ? editingRowRef : undefined}
          bg={location.archived ? 'neutralGray.100' : 'white'}
          display="flex"
          width="100%"
          role="group"
          key={location.id}
        >
          {editingLocation && editingLocation.id === location.id ? (
            <>
              <Box width="70%" pl={2}>
                <Input
                  value={editingLocation.name}
                  onChange={(e) =>
                    setEditingLocation({
                      ...editingLocation,
                      name: e.target.value,
                    })
                  }
                  size="sm"
                  flex="1"
                />
              </Box>
              <Box
                width="30%"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Input
                  value={editingLocation.abbreviation}
                  onChange={(e) =>
                    setEditingLocation({
                      ...editingLocation,
                      abbreviation: e.target.value,
                    })
                  }
                  size="sm"
                  maxW="60px"
                  maxLength={maxAbbreviationLength}
                />
                <HStack>
                  <Button
                    variant="outline"
                    onClick={handleSaveEditedLocation}
                    size="sm"
                    borderRadius="md"
                    p={0}
                  >
                    <IoCheckmark size={20} color={theme.colors.gray[600]} />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    size="sm"
                    borderRadius="md"
                    p={0}
                  >
                    <IoCloseOutline size={20} color={theme.colors.gray[600]} />
                  </Button>
                </HStack>
              </Box>
            </>
          ) : (
            <>
              <Box width="70%" pl={2}>
                <HStack>
                  {location.archived && (
                    <LuArchive
                      color={theme.colors.text.inactiveButtonText}
                      size={16}
                    />
                  )}
                  <Tooltip
                    label={location.name}
                    placement="top"
                    openDelay={300}
                    isDisabled={location.name.length <= 20}
                  >
                    <Box
                      position="relative"
                      width="100%"
                      maxWidth="170px"
                      overflow="hidden"
                    >
                      <Text
                        color={
                          location.archived
                            ? 'text.inactiveButtonText'
                            : 'inherit'
                        }
                        noOfLines={1}
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                        position="relative"
                        pr="30px"
                      >
                        {location.name}
                      </Text>
                      <Box
                        position="absolute"
                        right="0"
                        top="0"
                        height="100%"
                        width="30px"
                        background={`linear-gradient(to right, transparent, ${location.archived ? 'var(--chakra-colors-neutralGray-100)' : 'white'})`}
                        zIndex="1"
                        pointerEvents="none"
                      />
                    </Box>
                  </Tooltip>
                </HStack>
              </Box>
              <Box width="30%" display="flex" justifyContent="space-between">
                <Text
                  color={
                    location.archived ? 'text.inactiveButtonText' : 'inherit'
                  }
                >
                  {location.abbreviation}
                </Text>
                <Box
                  className="menu-button"
                  opacity="0"
                  _groupHover={{ opacity: '1' }}
                >
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      aria-label="Options"
                      icon={<IoEllipsisHorizontal />}
                      variant="ghost"
                      size="sm"
                    />
                    <MenuList>
                      <MenuItem
                        icon={<IoCreateOutline />}
                        onClick={() => handleEditLocation(location)}
                      >
                        Edit
                      </MenuItem>
                      <MenuItem
                        icon={<IoArchiveOutline />}
                        onClick={() => handleArchiveLocation(location)}
                      >
                        {location.archived ? 'Unarchive' : 'Archive'}
                      </MenuItem>
                      <Tooltip
                        label={
                          locationsInUse.includes(location.id)
                            ? 'Cannot delete location because it is used in existing absences'
                            : ''
                        }
                        isDisabled={!locationsInUse.includes(location.id)}
                      >
                        <MenuItem
                          icon={<IoTrashOutline />}
                          onClick={() => handleDeleteLocation(location)}
                          color="red.500"
                          isDisabled={locationsInUse.includes(location.id)}
                          bg={
                            locationsInUse.includes(location.id)
                              ? 'neutralGray.100'
                              : undefined
                          }
                          _hover={
                            locationsInUse.includes(location.id)
                              ? { bg: 'neutralGray.100' }
                              : undefined
                          }
                          cursor={
                            locationsInUse.includes(location.id)
                              ? 'not-allowed'
                              : 'pointer'
                          }
                        >
                          Delete
                        </MenuItem>
                      </Tooltip>
                    </MenuList>
                  </Menu>
                </Box>
              </Box>
            </>
          )}
        </Box>
      ))}

      {/* Add New Location Row */}
      {isAddingLocation ? (
        <Box
          p={3}
          borderBottomWidth="1px"
          display="flex"
          width="100%"
          ref={editingRowRef}
        >
          <Box width="70%" pl={2}>
            <Input
              value={newLocation.name}
              onChange={(e) =>
                setNewLocation({
                  ...newLocation,
                  name: e.target.value,
                })
              }
              placeholder="Location name"
              size="sm"
              flex="1"
            />
          </Box>
          <Box
            width="30%"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Input
              value={newLocation.abbreviation}
              onChange={(e) =>
                setNewLocation({
                  ...newLocation,
                  abbreviation: e.target.value,
                })
              }
              placeholder="Abbr."
              size="sm"
              maxW="60px"
              maxLength={maxAbbreviationLength}
            />
            <HStack>
              <Button
                variant="outline"
                onClick={handleAddLocation}
                size="sm"
                borderRadius="md"
                p={0}
              >
                <IoCheckmark size={20} color={theme.colors.gray[600]} />
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                size="sm"
                borderRadius="md"
                p={0}
              >
                <IoCloseOutline size={20} color={theme.colors.gray[600]} />
              </Button>
            </HStack>
          </Box>
        </Box>
      ) : null}

      {/* Add Button */}
      <HStack
        p={3}
        justify="flex-start"
        borderTopWidth={locations.length > 0 ? '1px' : '0'}
        bg="gray.50"
      >
        <Button
          leftIcon={<IoAdd />}
          size="sm"
          variant="ghost"
          onClick={() => setIsAddingLocation(true)}
        >
          Add
        </Button>
      </HStack>
    </Box>
  );
};

export default LocationsTable;
