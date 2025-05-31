import {
  Box,
  Button,
  Circle,
  HStack,
  Icon,
  IconButton,
  Input,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Spacer,
  Text,
  Tooltip,
  useTheme,
  VStack,
} from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiArchive, FiEdit2, FiMapPin, FiTrash2, FiType } from 'react-icons/fi';
import { IoAdd, IoBookOutline, IoEllipsisHorizontal } from 'react-icons/io5';
import { LuInfo } from 'react-icons/lu';
import AbsenceBox from '../../absences/AbsenceBox';

export interface EntityTableItem {
  id: number;
  name: string;
  abbreviation: string;
  archived: boolean;
  colorGroup?: {
    name: string;
    colorCodes: string[];
  };
  colorGroupId?: number;
}

interface ColorGroup {
  id: number;
  name: string;
  colorCodes: string[];
}

export interface EntityTableProps {
  title: string;
  entityType: 'subject' | 'location';
  items: EntityTableItem[];
  colorGroups: ColorGroup[];
  itemsInUse: number[];
  handleUpdateEntity: (entity: EntityTableItem | null, id?: number) => void;
  maxAbbreviationLength: number;
  maxFullNameLength?: number; // Optional max length for full names
  leftColumnWidth?: string; // Make column width configurable
}

const EntityTable: React.FC<EntityTableProps> = ({
  title,
  entityType,
  items,
  colorGroups,
  itemsInUse,
  handleUpdateEntity,
  maxAbbreviationLength,
  maxFullNameLength,
  leftColumnWidth = '60%', // Default to 60% if not specified
}) => {
  const COLOR_CODE_INDEX = 1;
  const ROW_HEIGHT = '50px'; // Use fixed row height as per design
  const theme = useTheme();
  const editingRowRef = useRef<HTMLDivElement>(null);
  const rightColumnWidth = `${100 - parseInt(leftColumnWidth)}%`; // Calculate right column width

  const [editingItem, setEditingItem] = useState<EntityTableItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [isDisplayFieldManuallyEdited, setIsDisplayFieldManuallyEdited] =
    useState(false);
  const [
    isNewItemDisplayFieldManuallyEdited,
    setIsNewItemDisplayFieldManuallyEdited,
  ] = useState(false);

  const [newItem, setNewItem] = useState<EntityTableItem>({
    id: 0,
    name: '',
    abbreviation: '',
    archived: false,
    ...(entityType === 'subject' && colorGroups.length > 0
      ? {
          colorGroup: colorGroups[0],
          colorGroupId: colorGroups[0].id,
        }
      : {}),
  });

  // Ensure newItem always has a valid color group for subjects
  useEffect(() => {
    if (
      entityType === 'subject' &&
      colorGroups.length > 0 &&
      (!newItem.colorGroup || !newItem.colorGroupId)
    ) {
      setNewItem((prev) => ({
        ...prev,
        colorGroup: colorGroups[0],
        colorGroupId: colorGroups[0].id,
      }));
    }
  }, [entityType, colorGroups, newItem.colorGroup, newItem.colorGroupId]);

  // Sort items: non-archived first (by ID), then archived (by ID)
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      // First sort by archived status
      if (a.archived !== b.archived) {
        return a.archived ? 1 : -1;
      }
      // Then sort by ID
      if (a.id >= 0 && b.id >= 0) {
        return a.id - b.id; // Normal order for existing entities (smaller IDs first)
      } else if (a.id < 0 && b.id < 0) {
        return b.id - a.id; // Reverse order for temp entities (more negative = newer = lower)
      } else {
        return a.id < 0 ? 1 : -1; // Temp entities (negative IDs) go to the bottom
      }
    });
  }, [items]);

  const handleEditItem = (item: EntityTableItem) => {
    setEditingItem(item);
    setOpenMenuId(null);

    // Check if abbreviation is custom (different from name prefix)
    const namePrefix = generateAbbreviationPrefix(
      item.name,
      maxAbbreviationLength
    );
    const hasCustomAbbreviation = item.abbreviation !== namePrefix;

    // Only auto-update if abbreviation isn't custom
    setIsDisplayFieldManuallyEdited(hasCustomAbbreviation);
  };

  // Calculate prefix for abbreviation (display) field
  const generateAbbreviationPrefix = (name: string, maxLength: number) => {
    return name.trim().substring(0, maxLength).trim();
  };

  const handleSaveEditedItem = useCallback(() => {
    // Only require name to be present, abbreviation is now optional
    if (!editingItem || !editingItem.name) return;

    // Validate abbreviation length if it exists
    if (
      editingItem.abbreviation &&
      editingItem.abbreviation.length > maxAbbreviationLength
    ) {
      // Toast handling would go here
      return;
    }

    // Validate full name length if maxFullNameLength is defined
    if (maxFullNameLength && editingItem.name.length > maxFullNameLength) {
      // Toast handling would go here
      return;
    }

    // If abbreviation is empty, set it to the name prefix
    const currentEditingItem = { ...editingItem };
    if (
      !currentEditingItem.abbreviation ||
      currentEditingItem.abbreviation.trim() === ''
    ) {
      currentEditingItem.abbreviation = generateAbbreviationPrefix(
        currentEditingItem.name,
        maxAbbreviationLength
      );
    }

    // Reset the editing state
    setEditingItem(null);
    setColorPickerOpen(null);
    setOpenMenuId(null);

    // Find the original item to compare changes
    const originalItem = items.find((i) => i.id === currentEditingItem.id);
    if (!originalItem) return;

    // Check if anything has changed
    const hasChanges =
      originalItem.name !== currentEditingItem.name ||
      originalItem.abbreviation !== currentEditingItem.abbreviation ||
      (entityType === 'subject' &&
        originalItem.colorGroupId !== currentEditingItem.colorGroupId);

    // Only update if something has changed
    if (hasChanges) {
      handleUpdateEntity(currentEditingItem);
    }
  }, [
    editingItem,
    items,
    handleUpdateEntity,
    maxAbbreviationLength,
    maxFullNameLength,
    entityType,
  ]);

  const handleAddItem = useCallback(() => {
    // Only require name to be present, abbreviation is now optional
    if (!newItem.name) return;

    // Validate abbreviation length if it exists
    if (
      newItem.abbreviation &&
      newItem.abbreviation.length > maxAbbreviationLength
    ) {
      // Toast handling would go here
      return;
    }

    // Validate full name length if maxFullNameLength is defined
    if (maxFullNameLength && newItem.name.length > maxFullNameLength) {
      // Toast handling would go here
      return;
    }

    // If abbreviation is empty, set it to the name prefix
    const itemToAdd = { ...newItem };
    if (!itemToAdd.abbreviation || itemToAdd.abbreviation.trim() === '') {
      itemToAdd.abbreviation = generateAbbreviationPrefix(
        itemToAdd.name,
        maxAbbreviationLength
      );
    }

    // Reset form and close it
    handleUpdateEntity(itemToAdd);

    setNewItem({
      id: 0,
      name: '',
      abbreviation: '',
      archived: false,
      ...(entityType === 'subject' && colorGroups.length > 0
        ? {
            colorGroup: colorGroups[0],
            colorGroupId: colorGroups[0].id,
          }
        : {}),
    });
    setIsAddingItem(false);
    setColorPickerOpen(null);
  }, [
    newItem,
    maxAbbreviationLength,
    maxFullNameLength,
    handleUpdateEntity,
    colorGroups,
    entityType,
  ]);

  const handleCancelEdit = () => {
    setEditingItem(null);
    setIsAddingItem(false);
    setColorPickerOpen(null);
    setIsDisplayFieldManuallyEdited(false);
    setIsNewItemDisplayFieldManuallyEdited(false);
  };

  const handleArchiveItem = (item: EntityTableItem) => {
    // Create a modified item with the archive status toggled
    const updatedItem = {
      ...item,
      archived: !item.archived,
    };

    setOpenMenuId(null);
    handleUpdateEntity(updatedItem);
  };

  const handleDeleteItem = (item: EntityTableItem) => {
    setOpenMenuId(null);
    handleUpdateEntity(null, item.id);
  };

  // Tooltip component for showing the abbreviation preview
  const AbbreviationPreview = ({
    subject,
    abbreviation,
    location,
    colorCodes,
  }: {
    subject: string;
    abbreviation: string;
    location: string;
    colorCodes: string[];
  }) => {
    return (
      <AbsenceBox
        title={subject}
        abbreviation={abbreviation}
        location={location}
        backgroundColor={colorCodes[3]}
        borderColor={colorCodes[1]}
        textColor={colorCodes[0]}
        opacity={1}
        isSelected={false}
      />
    );
  };

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editingRowRef.current &&
        !editingRowRef.current.contains(event.target as Node)
      ) {
        if (editingItem) {
          handleSaveEditedItem();
        } else if (isAddingItem) {
          // Cancel adding if name is empty - just close the form without adding
          if (!newItem.name.trim()) {
            handleCancelEdit();
          } else {
            handleAddItem();
          }
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingItem, isAddingItem, newItem, handleAddItem, handleSaveEditedItem]);

  const nameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const abbreviationRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [nameTooltipStates, setNameTooltipStates] = useState<boolean[]>([]);
  const [abbrTooltipStates, setAbbrTooltipStates] = useState<boolean[]>([]);

  useEffect(() => {
    const nameStates = nameRefs.current.map((el) =>
      el ? el.scrollWidth > el.clientWidth : false
    );
    const abbrStates = abbreviationRefs.current.map((el) =>
      el ? el.scrollWidth > el.clientWidth : false
    );
    setNameTooltipStates(nameStates);
    setAbbrTooltipStates(abbrStates);
  }, [items]);

  return (
    <Box borderWidth="1px" borderRadius="md" overflow="hidden">
      {/* Table Header */}
      <Box p={4} bg="white" borderBottomWidth="1px" display="flex" width="100%">
        <Box width={leftColumnWidth} pr={4}>
          <HStack spacing={2}>
            {entityType === 'subject' ? (
              <Icon as={IoBookOutline} boxSize="18px" color="text.subtitle" />
            ) : (
              <Icon as={FiMapPin} boxSize="18px" color="text.subtitle" />
            )}
            <Text
              textStyle="h4"
              fontWeight="500"
              color={theme.colors.text.subtitle}
            >
              {title}
            </Text>
            <Spacer />
            <Tooltip
              label={
                <Box>
                  <Text>
                    The{' '}
                    <Text as="span" color="primaryBlue.300" fontWeight="bold">
                      full
                    </Text>{' '}
                    {entityType} name; shown
                    <Text as="span" color="primaryBlue.300" fontWeight="bold">
                      {' '}
                      everywhere except
                    </Text>{' '}
                    widget titles.
                    {maxFullNameLength && (
                      <>
                        {' '}
                        Max{' '}
                        <Text
                          as="span"
                          color="primaryBlue.300"
                          fontWeight="bold"
                        >
                          {maxFullNameLength}
                        </Text>{' '}
                        characters.
                      </>
                    )}
                  </Text>
                </Box>
              }
              placement="top"
              hasArrow
              width="300px"
            >
              <Box as="span" ml={1} color="primaryBlue.300" cursor="help">
                <LuInfo />
              </Box>
            </Tooltip>
          </HStack>
        </Box>
        <Box width={rightColumnWidth} pl={4}>
          <HStack spacing={2}>
            <Icon as={FiType} boxSize="18px" color="text.subtitle" />
            <Text
              textStyle="h4"
              fontWeight="500"
              color={theme.colors.text.subtitle}
            >
              Display
            </Text>
            <Spacer />
            <Tooltip
              label={
                <Box>
                  <Text>
                    An{' '}
                    <Text as="span" color="primaryBlue.300" fontWeight="bold">
                      abbreviated
                    </Text>{' '}
                    version of the {entityType} name; shown in{' '}
                    <Text as="span" color="primaryBlue.300" fontWeight="bold">
                      widget titles
                    </Text>
                    . Max{' '}
                    <Text as="span" color="primaryBlue.300" fontWeight="bold">
                      {maxAbbreviationLength}
                    </Text>{' '}
                    characters.
                  </Text>
                  <AbbreviationPreview
                    subject="Percussion"
                    abbreviation="PER"
                    location="Lambton"
                    colorCodes={colorGroups[0].colorCodes}
                  />
                </Box>
              }
              placement="top"
              hasArrow
              width="300px"
            >
              <Box as="span" ml={1} color="primaryBlue.300" cursor="help">
                <LuInfo />
              </Box>
            </Tooltip>
          </HStack>
        </Box>
      </Box>

      {/* Table Rows */}
      {sortedItems.map((item, index) => (
        <Box
          px={4}
          py={2}
          _last={{ borderBottomWidth: 0 }}
          ref={editingItem?.id === item.id ? editingRowRef : undefined}
          bg={item.archived ? 'neutralGray.100' : 'white'}
          display="flex"
          width="100%"
          role="group"
          alignItems="center"
          key={item.id}
          transition="background-color 0.3s ease"
          height={ROW_HEIGHT}
          borderColor={
            editingItem?.id === item.id
              ? theme.colors.primaryBlue[300]
              : theme.colors.neutralGray[200]
          }
          borderWidth={editingItem?.id === item.id ? '1px' : '0px'}
          borderBottomWidth="1px"
          borderRadius={editingItem?.id === item.id ? '5px' : '0px'}
          position={editingItem?.id === item.id ? 'relative' : 'static'}
        >
          {editingItem && editingItem.id === item.id ? (
            <>
              <Box
                width={leftColumnWidth}
                pr={4}
                display="flex"
                alignItems="center"
              >
                <HStack spacing={2} alignItems="center">
                  {entityType === 'subject' && (
                    <Box position="relative">
                      <Circle
                        size="20px"
                        bg={
                          editingItem.colorGroup?.colorCodes[COLOR_CODE_INDEX]
                        }
                        cursor="pointer"
                        onClick={() => setColorPickerOpen(item.id)}
                        transition="transform 0.2s ease"
                        _hover={{ transform: 'scale(1.1)' }}
                      />
                      {colorPickerOpen === item.id && (
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
                          opacity={1}
                          transform="translateY(0)"
                          transition="opacity 0.3s ease, transform 0.3s ease"
                        >
                          <Box
                            display="grid"
                            gridTemplateColumns="repeat(4, 1fr)"
                            gap={2}
                          >
                            {colorGroups.map((group) => (
                              <Circle
                                key={group.id}
                                size="20px"
                                bg={group.colorCodes[COLOR_CODE_INDEX]}
                                border="2px solid"
                                borderColor={
                                  editingItem?.colorGroup?.name === group.name
                                    ? `${group.colorCodes[0]}`
                                    : 'transparent'
                                }
                                cursor="pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingItem({
                                    ...editingItem,
                                    colorGroup: group,
                                    colorGroupId: group.id,
                                  });
                                  setColorPickerOpen(null);
                                }}
                                transition="transform 0.2s ease"
                                _hover={{ transform: 'scale(1.1)' }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  )}
                  {entityType === 'subject' && <Box width={3} />}
                  <Input
                    value={editingItem.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      // Auto-generate abbreviation if not manually edited
                      const newAbbreviation = !isDisplayFieldManuallyEdited
                        ? generateAbbreviationPrefix(
                            newName,
                            maxAbbreviationLength
                          )
                        : editingItem.abbreviation;

                      setEditingItem({
                        ...editingItem,
                        name: newName,
                        abbreviation: newAbbreviation,
                      });
                    }}
                    placeholder={`${title} name`}
                    size="sm"
                    flex="1"
                    maxLength={maxFullNameLength}
                    border="none"
                    _focus={{ boxShadow: 'none' }}
                    textStyle="cellBody"
                    fontSize="15px"
                    px="0"
                    borderRadius="0"
                    height="auto"
                    ml={entityType !== 'subject' ? '0' : undefined}
                  />
                </HStack>
              </Box>
              <Box
                width={rightColumnWidth}
                pl={4}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Input
                  value={editingItem.abbreviation}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    // If the field is cleared, turn off manual edit mode to allow auto-updating again
                    if (!newValue || newValue.trim() === '') {
                      setIsDisplayFieldManuallyEdited(false);
                    } else {
                      setIsDisplayFieldManuallyEdited(true);
                    }

                    setEditingItem({
                      ...editingItem,
                      abbreviation: newValue.trim(),
                    });
                  }}
                  onBlur={() => {
                    // If the display field is empty when it loses focus, immediately fill it
                    if (
                      !editingItem.abbreviation ||
                      editingItem.abbreviation.trim() === ''
                    ) {
                      setEditingItem({
                        ...editingItem,
                        abbreviation: generateAbbreviationPrefix(
                          editingItem.name,
                          maxAbbreviationLength
                        ),
                      });
                    }
                  }}
                  placeholder="Abbr."
                  size="sm"
                  maxW="100px"
                  maxLength={maxAbbreviationLength}
                  border="none"
                  _focus={{ boxShadow: 'none' }}
                  textStyle="cellBody"
                  fontSize="15px"
                  px="0"
                  borderRadius="0"
                  height="auto"
                />
              </Box>
            </>
          ) : (
            <>
              <Box
                width={leftColumnWidth}
                pr={4}
                alignItems="center"
                flexShrink={0}
              >
                <HStack spacing={2}>
                  {entityType === 'subject' && (
                    <>
                      <Circle
                        size="20px"
                        bg={item.colorGroup?.colorCodes[COLOR_CODE_INDEX]}
                      />
                      <Box width={3} />
                    </>
                  )}
                  {item.archived && (
                    <FiArchive
                      color={theme.colors.text.inactiveButtonText}
                      size={15}
                    />
                  )}
                  <Tooltip
                    label={item.name}
                    placement="top"
                    openDelay={300}
                    isDisabled={!nameTooltipStates[index]}
                    hasArrow
                  >
                    <Box
                      position="relative"
                      width="100%"
                      overflow="hidden"
                      flex={1}
                    >
                      <Text
                        ref={(el) => {
                          nameRefs.current[index] = el;
                        }}
                        color={
                          item.archived ? 'text.inactiveButtonText' : 'inherit'
                        }
                        noOfLines={1}
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                        position="relative"
                        pr="30px"
                        textStyle="cellBody"
                        transition="color 0.3s ease"
                      >
                        {item.name}
                      </Text>
                      <Box
                        position="absolute"
                        right="0"
                        top="0"
                        height="100%"
                        width="30px"
                        background={`linear-gradient(to right, transparent, ${item.archived ? 'var(--chakra-colors-neutralGray-100)' : 'white'})`}
                        zIndex="1"
                        pointerEvents="none"
                        transition="background 0.3s ease"
                      />
                    </Box>
                  </Tooltip>
                </HStack>
              </Box>
              <Box
                width={rightColumnWidth}
                pl={4}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                gap={3}
              >
                <Tooltip
                  label={item.abbreviation}
                  placement="top"
                  openDelay={300}
                  isDisabled={!abbrTooltipStates[index]}
                  hasArrow
                >
                  <Box position="relative" overflow="hidden" flex={1}>
                    <Text
                      ref={(el) => {
                        abbreviationRefs.current[index] = el;
                      }}
                      color={
                        item.archived ? 'text.inactiveButtonText' : 'inherit'
                      }
                      textStyle="cellBody"
                      transition="color 0.3s ease"
                      noOfLines={1}
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                      position="relative"
                      pr="15px"
                    >
                      {item.abbreviation}
                    </Text>
                    <Box
                      position="absolute"
                      right="0"
                      top="0"
                      height="100%"
                      width="15px"
                      background={`linear-gradient(to right, transparent, ${item.archived ? 'var(--chakra-colors-neutralGray-100)' : 'white'})`}
                      zIndex="1"
                      pointerEvents="none"
                      transition="background 0.3s ease"
                    />
                  </Box>
                </Tooltip>
                <Box
                  className="action-button"
                  opacity={openMenuId === item.id ? '1' : '0'}
                  _groupHover={{ opacity: '1' }}
                  transition="opacity 0.3s ease"
                >
                  <Popover
                    isOpen={openMenuId === item.id}
                    onOpen={() => setOpenMenuId(item.id)}
                    onClose={() => setOpenMenuId(null)}
                    placement="bottom-end"
                    isLazy
                  >
                    <PopoverTrigger>
                      <IconButton
                        aria-label="Options"
                        icon={<IoEllipsisHorizontal />}
                        variant="ghost"
                        size="sm"
                        transition="opacity 0.2s ease"
                      />
                    </PopoverTrigger>
                    <PopoverContent width="auto" boxShadow="md">
                      <PopoverBody p={0}>
                        <VStack align="stretch" spacing={0}>
                          <Button
                            leftIcon={
                              <FiEdit2
                                color={theme.colors.neutralGray[600]}
                                size={15}
                              />
                            }
                            onClick={() => handleEditItem(item)}
                            variant="ghost"
                            justifyContent="flex-start"
                            width="100%"
                            textStyle="label"
                            fontSize={12}
                            color="body"
                            borderRadius={0}
                            py={2}
                          >
                            Edit
                          </Button>
                          <Button
                            leftIcon={
                              <FiArchive
                                color={theme.colors.neutralGray[600]}
                                size={15}
                              />
                            }
                            onClick={() => handleArchiveItem(item)}
                            variant="ghost"
                            justifyContent="flex-start"
                            width="100%"
                            textStyle="label"
                            fontSize={12}
                            color="body"
                            borderRadius={0}
                            py={2}
                          >
                            {item.archived ? 'Unarchive' : 'Archive'}
                          </Button>
                          <Tooltip
                            label={
                              itemsInUse.includes(item.id)
                                ? `Cannot delete ${entityType} because it is used in existing absences`
                                : ''
                            }
                            isDisabled={!itemsInUse.includes(item.id)}
                            hasArrow
                          >
                            <Button
                              leftIcon={
                                <FiTrash2
                                  color={theme.colors.neutralGray[600]}
                                  size={15}
                                />
                              }
                              onClick={() => handleDeleteItem(item)}
                              isDisabled={itemsInUse.includes(item.id)}
                              variant="ghost"
                              justifyContent="flex-start"
                              width="100%"
                              textStyle="label"
                              fontSize={12}
                              color="body"
                              py={2}
                              borderRadius={0}
                              bg={
                                itemsInUse.includes(item.id)
                                  ? 'neutralGray.100'
                                  : undefined
                              }
                              _hover={
                                itemsInUse.includes(item.id)
                                  ? { bg: 'neutralGray.100' }
                                  : undefined
                              }
                              cursor={
                                itemsInUse.includes(item.id)
                                  ? 'not-allowed'
                                  : 'pointer'
                              }
                            >
                              Delete
                            </Button>
                          </Tooltip>
                        </VStack>
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                </Box>
              </Box>
            </>
          )}
        </Box>
      ))}

      {/* Add New Item Row */}
      {isAddingItem ? (
        <Box
          px={4}
          py={2}
          borderBottomWidth="1px"
          display="flex"
          width="100%"
          ref={editingRowRef}
          animation="fadeIn 0.3s ease"
          sx={{
            '@keyframes fadeIn': {
              '0%': { opacity: 0, transform: 'translateY(-10px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' },
            },
          }}
          height={ROW_HEIGHT}
          borderWidth="1px"
          borderColor={theme.colors.primaryBlue[300]}
          borderRadius="5px"
          position="relative"
          zIndex="1"
        >
          <Box
            width={leftColumnWidth}
            pr={4}
            display="flex"
            alignItems="center"
          >
            <HStack spacing={2} alignItems="center">
              {entityType === 'subject' && (
                <Box position="relative">
                  <Circle
                    size="20px"
                    bg={
                      newItem.colorGroupId
                        ? colorGroups.find(
                            (cg) => cg.id === newItem.colorGroupId
                          )?.colorCodes[COLOR_CODE_INDEX]
                        : colorGroups[0]?.colorCodes[COLOR_CODE_INDEX] ||
                          '#CBD5E0'
                    }
                    cursor="pointer"
                    onClick={() => setColorPickerOpen(-1)}
                    transition="transform 0.2s ease"
                    _hover={{ transform: 'scale(1.1)' }}
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
                      opacity={1}
                      transform="translateY(0)"
                      transition="opacity 0.3s ease, transform 0.3s ease"
                    >
                      <Box
                        display="grid"
                        gridTemplateColumns="repeat(4, 1fr)"
                        gap={2}
                      >
                        {colorGroups.map((group) => (
                          <Circle
                            key={group.id}
                            size="20px"
                            bg={group.colorCodes[COLOR_CODE_INDEX]}
                            border="2px solid"
                            borderColor={
                              newItem?.colorGroup?.name === group.name
                                ? `${group.colorCodes[0]}`
                                : 'transparent'
                            }
                            cursor="pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setNewItem({
                                ...newItem,
                                colorGroup: group,
                                colorGroupId: group.id,
                              });
                              setColorPickerOpen(null);
                            }}
                            transition="transform 0.2s ease"
                            _hover={{ transform: 'scale(1.1)' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
              {entityType === 'subject' && <Box width={3} />}
              <Input
                value={newItem.name}
                onChange={(e) => {
                  const newName = e.target.value;
                  // Auto-generate abbreviation if not manually edited
                  const newAbbreviation = !isNewItemDisplayFieldManuallyEdited
                    ? generateAbbreviationPrefix(newName, maxAbbreviationLength)
                    : newItem.abbreviation;

                  setNewItem({
                    ...newItem,
                    name: newName,
                    abbreviation: newAbbreviation,
                  });
                }}
                placeholder={`${title} name`}
                size="sm"
                flex="1"
                maxLength={maxFullNameLength}
                border="none"
                _focus={{ boxShadow: 'none' }}
                textStyle="cellBody"
                fontSize="15px"
                px="0"
                borderRadius="0"
                height="auto"
                ml={entityType !== 'subject' ? '0' : undefined}
              />
            </HStack>
          </Box>
          <Box
            width={rightColumnWidth}
            pl={4}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Input
              value={newItem.abbreviation}
              onChange={(e) => {
                const newValue = e.target.value;
                // If the field is cleared, turn off manual edit mode to allow auto-updating again
                if (!newValue || newValue.trim() === '') {
                  setIsNewItemDisplayFieldManuallyEdited(false);
                } else {
                  setIsNewItemDisplayFieldManuallyEdited(true);
                }

                setNewItem({
                  ...newItem,
                  abbreviation: newValue.trim(),
                });
              }}
              onBlur={() => {
                // If the display field is empty when it loses focus, immediately fill it
                if (
                  !newItem.abbreviation ||
                  newItem.abbreviation.trim() === ''
                ) {
                  setNewItem({
                    ...newItem,
                    abbreviation: generateAbbreviationPrefix(
                      newItem.name,
                      maxAbbreviationLength
                    ),
                  });
                }
              }}
              placeholder="Abbr."
              size="sm"
              maxW="100px"
              maxLength={maxAbbreviationLength}
              border="none"
              _focus={{ boxShadow: 'none' }}
              textStyle="cellBody"
              fontSize="15px"
              px="0"
              borderRadius="0"
              height="auto"
            />
          </Box>
        </Box>
      ) : null}

      {/* Add Button */}
      <Box
        as="button"
        width="100%"
        onClick={() => {
          setIsAddingItem(true);
          // Reset the new item manually edited flag when starting to add a new item
          setIsNewItemDisplayFieldManuallyEdited(false);
        }}
        _hover={{ bg: 'neutralGray.100' }}
        transition="background-color 0.2s ease"
        textAlign="left"
        borderTopWidth={items.length > 0 ? '1px' : '0'}
        height={ROW_HEIGHT}
      >
        <HStack px={4} py={2} spacing={2} justify="flex-start">
          <Icon as={IoAdd} size={20} color={theme.colors.text.subtitle} />
          <Text
            textStyle="h4"
            fontWeight="500"
            color={theme.colors.text.subtitle}
          >
            Add
          </Text>
        </HStack>
      </Box>
    </Box>
  );
};

export default EntityTable;
