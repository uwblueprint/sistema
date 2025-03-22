import React, { useRef, useState } from 'react';
import {
  Box,
  Text,
  HStack,
  Circle,
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
import { SubjectAPI } from '@utils/types';
import { Change } from './SystemChangesConfirmationDialog';

interface SubjectsTableProps {
  subjects: SubjectAPI[];
  colorGroups: { id: number; name: string; colorCodes: string[] }[];
  subjectsInUse: number[];
  handleAddChange: (change: Change) => void;
  maxAbbreviationLength: number;
}

const SubjectsTable: React.FC<SubjectsTableProps> = ({
  subjects,
  colorGroups,
  subjectsInUse,
  handleAddChange,
  maxAbbreviationLength,
}) => {
  const COLOR_CODE_INDEX = 1;
  const theme = useTheme();
  const editingRowRef = useRef<HTMLDivElement>(null);

  const [editingSubject, setEditingSubject] = useState<SubjectAPI | null>(null);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState<number | null>(null);
  const [newSubject, setNewSubject] = useState<SubjectAPI>({
    id: 0,
    name: '',
    abbreviation: '',
    colorGroup: {
      name: 'Strings',
      colorCodes: ['#f44336', '#ff9800', '#ffeb3b'],
    },
    colorGroupId: 1,
    archived: false,
  });

  const handleEditSubject = (subject: SubjectAPI) => {
    setEditingSubject(subject);
  };

  const handleSaveEditedSubject = () => {
    if (!editingSubject || !editingSubject.name || !editingSubject.abbreviation)
      return;

    // Validate abbreviation length
    if (editingSubject.abbreviation.length > maxAbbreviationLength) {
      // You'd need to add toast handling here or pass a callback
      return;
    }

    // Store the current editing state
    const currentEditingSubject = { ...editingSubject };

    // Reset the editing state first
    setEditingSubject(null);
    setColorPickerOpen(null);

    // Find colorGroupId based on name
    const colorGroupId = currentEditingSubject.colorGroupId;
    if (!colorGroupId) return;

    // Find the original subject to compare changes
    const originalSubject = subjects.find(
      (s) => s.id === currentEditingSubject.id
    );
    if (!originalSubject) return;

    // Only include fields that have changed
    const changedData: any = {};

    if (originalSubject.name !== currentEditingSubject.name) {
      changedData.name = currentEditingSubject.name;
      // Store original name for change history
      changedData.originalName = originalSubject.name;
    }

    if (originalSubject.abbreviation !== currentEditingSubject.abbreviation) {
      changedData.abbreviation = currentEditingSubject.abbreviation;
      // Store original abbreviation for change history
      changedData.originalAbbreviation = originalSubject.abbreviation;
    }

    if (originalSubject.colorGroupId !== colorGroupId) {
      changedData.colorGroupId = colorGroupId;
      // Store original color group for change history
      changedData.originalColorGroupId = originalSubject.colorGroupId;
    }

    // Only proceed if there are actual changes
    if (Object.keys(changedData).length > 0) {
      // Check if all values being changed are actually the same as original values
      const allChangesReverted =
        (changedData.name === undefined ||
          changedData.name === changedData.originalName) &&
        (changedData.abbreviation === undefined ||
          changedData.abbreviation === changedData.originalAbbreviation) &&
        (changedData.colorGroupId === undefined ||
          changedData.colorGroupId === changedData.originalColorGroupId);

      // Only add the change if something is actually different
      if (!allChangesReverted) {
        handleAddChange({
          type: 'update',
          entity: 'subject',
          id: currentEditingSubject.id!,
          data: changedData,
          displayText: `Updated Subject "${currentEditingSubject.name}"`,
        });
      }
    }
  };

  const handleAddSubject = () => {
    if (!newSubject.name || !newSubject.abbreviation) return;

    // Validate abbreviation length
    if (newSubject.abbreviation.length > maxAbbreviationLength) {
      // You'd need to add toast handling here or pass a callback
      return;
    }

    // Find colorGroupId based on name
    const colorGroupId = newSubject.colorGroupId;
    if (!colorGroupId) return;

    // Create a temporary ID for the new subject (negative to avoid conflicts)
    const tempId = -Date.now();

    handleAddChange({
      type: 'add',
      entity: 'subject',
      id: tempId,
      data: {
        name: newSubject.name,
        abbreviation: newSubject.abbreviation,
        colorGroupId: colorGroupId,
      },
      displayText: `Added Subject "${newSubject.name}"`,
    });

    // Reset form and close it
    setNewSubject({
      id: 0,
      name: '',
      abbreviation: '',
      colorGroup: {
        name: 'Strings',
        colorCodes: ['#f44336', '#ff9800', '#ffeb3b'],
      },
      colorGroupId: 1,
      archived: false,
    });
    setIsAddingSubject(false);
    setColorPickerOpen(null);
  };

  const handleCancelEdit = () => {
    setEditingSubject(null);
    setIsAddingSubject(false);
    setColorPickerOpen(null);
  };

  const handleArchiveSubject = (subject: SubjectAPI) => {
    handleAddChange({
      type: subject.archived ? 'unarchive' : 'archive',
      entity: 'subject',
      id: subject.id,
      data: { archived: !subject.archived },
      displayText: `${subject.archived ? 'Unarchived' : 'Archived'} Subject "${subject.name}"`,
    });
  };

  const handleDeleteSubject = (subject: SubjectAPI) => {
    handleAddChange({
      type: 'delete',
      entity: 'subject',
      id: subject.id,
      displayText: `Deleted Subject "${subject.name}"`,
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
            <Text fontWeight="medium">Subject</Text>
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
                The full subject name
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
                The abbreviated subject name
                <br />
                (max {maxAbbreviationLength} characters)
              </Box>
            </Box>
          </HStack>
        </Box>
      </Box>

      {/* Table Rows */}
      {subjects.map((subject) => (
        <Box
          p={3}
          borderBottomWidth="1px"
          _last={{ borderBottomWidth: 0 }}
          ref={editingSubject?.id === subject.id ? editingRowRef : undefined}
          bg={subject.archived ? 'neutralGray.100' : 'white'}
          display="flex"
          width="100%"
          role="group"
          key={subject.id}
        >
          {editingSubject && editingSubject.id === subject.id ? (
            <>
              <Box width="70%" pl={2}>
                <HStack>
                  <Box position="relative">
                    <Circle
                      size="24px"
                      bg={
                        editingSubject.colorGroup.colorCodes[COLOR_CODE_INDEX]
                      }
                      cursor="pointer"
                      onClick={() => setColorPickerOpen(subject.id)}
                    />
                    {colorPickerOpen === subject.id && (
                      <Box
                        position="absolute"
                        top="100%"
                        left="0"
                        zIndex={10}
                        bg="white"
                        borderWidth="1px"
                        borderRadius="md"
                        boxShadow="md"
                        p={2}
                        width="auto"
                      >
                        <Box
                          display="grid"
                          gridTemplateColumns="repeat(4, 1fr)"
                          gap={2}
                        >
                          {colorGroups.map((group) => (
                            <Circle
                              key={group.id}
                              size="24px"
                              bg={group.colorCodes[COLOR_CODE_INDEX]}
                              border="2px solid"
                              borderColor={
                                editingSubject?.colorGroup?.name === group.name
                                  ? `${group.colorCodes[0]}` // Use darker color from array for selected item
                                  : 'transparent'
                              }
                              cursor="pointer"
                              onClick={() => {
                                setEditingSubject({
                                  ...editingSubject,
                                  colorGroup: group,
                                  colorGroupId: group.id,
                                });
                                setColorPickerOpen(null);
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                  <Input
                    value={editingSubject.name}
                    onChange={(e) =>
                      setEditingSubject({
                        ...editingSubject,
                        name: e.target.value,
                      })
                    }
                    size="sm"
                    flex="1"
                  />
                </HStack>
              </Box>
              <Box
                width="30%"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Input
                  value={editingSubject.abbreviation}
                  onChange={(e) =>
                    setEditingSubject({
                      ...editingSubject,
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
                    onClick={handleSaveEditedSubject}
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
                  <Circle
                    size="24px"
                    bg={subject.colorGroup.colorCodes[COLOR_CODE_INDEX]}
                  />
                  {subject.archived && (
                    <LuArchive
                      color={theme.colors.text.inactiveButtonText}
                      size={16}
                    />
                  )}
                  <Tooltip
                    label={subject.name}
                    placement="top"
                    openDelay={300}
                    isDisabled={subject.name.length <= 20}
                  >
                    <Box
                      position="relative"
                      width="100%"
                      maxWidth="170px"
                      overflow="hidden"
                    >
                      <Text
                        color={
                          subject.archived
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
                        {subject.name}
                      </Text>
                      <Box
                        position="absolute"
                        right="0"
                        top="0"
                        height="100%"
                        width="30px"
                        background={`linear-gradient(to right, transparent, ${subject.archived ? 'var(--chakra-colors-neutralGray-100)' : 'white'})`}
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
                    subject.archived ? 'text.inactiveButtonText' : 'inherit'
                  }
                >
                  {subject.abbreviation}
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
                        onClick={() => handleEditSubject(subject)}
                      >
                        Edit
                      </MenuItem>
                      <MenuItem
                        icon={<IoArchiveOutline />}
                        onClick={() => handleArchiveSubject(subject)}
                      >
                        {subject.archived ? 'Unarchive' : 'Archive'}
                      </MenuItem>
                      <Tooltip
                        label={
                          subjectsInUse.includes(subject.id)
                            ? 'Cannot delete subject because it is used in existing absences'
                            : ''
                        }
                        isDisabled={!subjectsInUse.includes(subject.id)}
                      >
                        <MenuItem
                          icon={<IoTrashOutline />}
                          onClick={() => handleDeleteSubject(subject)}
                          color="red.500"
                          isDisabled={subjectsInUse.includes(subject.id)}
                          bg={
                            subjectsInUse.includes(subject.id)
                              ? 'neutralGray.100'
                              : undefined
                          }
                          _hover={
                            subjectsInUse.includes(subject.id)
                              ? { bg: 'neutralGray.100' }
                              : undefined
                          }
                          cursor={
                            subjectsInUse.includes(subject.id)
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

      {/* Add New Subject Row */}
      {isAddingSubject ? (
        <Box
          p={3}
          borderBottomWidth="1px"
          display="flex"
          width="100%"
          ref={editingRowRef}
        >
          <Box width="70%" pl={2}>
            <HStack>
              <Box position="relative">
                <Circle
                  size="24px"
                  bg={
                    colorGroups.find(
                      (cg) => cg.name === newSubject.colorGroup.name
                    )?.colorCodes[COLOR_CODE_INDEX] || '#CBD5E0'
                  }
                  cursor="pointer"
                  onClick={() => setColorPickerOpen(-1)}
                />
                {colorPickerOpen === -1 && (
                  <Box
                    position="absolute"
                    top="100%"
                    left="0"
                    zIndex={10}
                    bg="white"
                    borderWidth="1px"
                    borderRadius="md"
                    boxShadow="md"
                    p={2}
                    width="auto"
                  >
                    <Box
                      display="grid"
                      gridTemplateColumns="repeat(4, 1fr)"
                      gap={2}
                    >
                      {colorGroups.map((group) => (
                        <Circle
                          key={group.id}
                          size="24px"
                          bg={group.colorCodes[COLOR_CODE_INDEX]}
                          border="2px solid"
                          borderColor={
                            newSubject?.colorGroup?.name === group.name
                              ? `${group.colorCodes[0]}` // Use darker color from array for selected item
                              : 'transparent'
                          }
                          cursor="pointer"
                          onClick={() => {
                            setNewSubject({
                              ...newSubject,
                              colorGroup: group,
                              colorGroupId: group.id,
                            });
                            setColorPickerOpen(null);
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
              <Input
                value={newSubject.name}
                onChange={(e) =>
                  setNewSubject({
                    ...newSubject,
                    name: e.target.value,
                  })
                }
                placeholder="Subject name"
                size="sm"
                flex="1"
              />
            </HStack>
          </Box>
          <Box
            width="30%"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Input
              value={newSubject.abbreviation}
              onChange={(e) =>
                setNewSubject({
                  ...newSubject,
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
                onClick={handleAddSubject}
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
        borderTopWidth={subjects.length > 0 ? '1px' : '0'}
        bg="gray.50"
      >
        <Button
          leftIcon={<IoAdd />}
          size="sm"
          variant="ghost"
          onClick={() => setIsAddingSubject(true)}
        >
          Add
        </Button>
      </HStack>
    </Box>
  );
};

export default SubjectsTable;
