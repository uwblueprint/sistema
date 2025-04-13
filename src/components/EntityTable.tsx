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
  Portal,
  Spacer,
  Text,
  Tooltip,
  useTheme,
  VStack,
} from '@chakra-ui/react';
import React, { useMemo, useRef, useState } from 'react';
import { FiArchive, FiEdit2, FiMapPin, FiTrash2, FiType } from 'react-icons/fi';
import {
  IoAdd,
  IoBookOutline,
  IoCheckmark,
  IoCloseOutline,
  IoEllipsisHorizontal,
} from 'react-icons/io5';
import { LuInfo } from 'react-icons/lu';
import AbsenceBox from './AbsenceBox';

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
  React.useEffect(() => {
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
  };

  const handleSaveEditedItem = () => {
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

    // Store the current editing state
    const currentEditingItem = { ...editingItem };

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
  };

  const handleAddItem = () => {
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

    // Create a temporary item with the new data
    const itemToAdd = {
      ...newItem,
      id: 0, // This will be replaced with a negative ID by the change management hook
    };

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
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setIsAddingItem(false);
    setColorPickerOpen(null);
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
    location,
    colorCodes,
  }: {
    subject: string;
    location: string;
    colorCodes: string[];
  }) => {
    return (
      <AbsenceBox
        title={subject}
        location={location}
        backgroundColor={colorCodes[3]}
        borderColor={colorCodes[1]}
        textColor={colorCodes[0]}
        opacity={1}
      />
    );
  };

  return (
    <Box borderWidth="1px" borderRadius="md" overflow="hidden">
      {/* Table Header */}
      <Box p={4} bg="white" borderBottomWidth="1px" display="flex" width="100%">
        <Box width={leftColumnWidth} pr={4}>
          <HStack spacing={2}>
            {entityType === 'subject' ? (
              <IoBookOutline size={18} color={theme.colors.text.subtitle} />
            ) : (
              <FiMapPin size={18} color={theme.colors.text.subtitle} />
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
            <FiType size={18} color={theme.colors.text.subtitle} />
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
                    subject="STR"
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
      {sortedItems.map((item) => (
        <Box
          px={4}
          py={2}
          borderBottomWidth="1px"
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
        >
          {editingItem && editingItem.id === item.id ? (
            <>
              <Box width={leftColumnWidth} pr={4}>
                <HStack spacing={5}>
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
                  <Input
                    value={editingItem.name}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        name: e.target.value,
                      })
                    }
                    size="sm"
                    flex="1"
                    maxLength={maxFullNameLength}
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
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
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
                    onClick={handleSaveEditedItem}
                    size="sm"
                    borderRadius="md"
                    p={0}
                    transition="background-color 0.2s ease"
                  >
                    <IoCheckmark size={20} color={theme.colors.gray[600]} />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    size="sm"
                    borderRadius="md"
                    p={0}
                    transition="background-color 0.2s ease"
                  >
                    <IoCloseOutline size={20} color={theme.colors.gray[600]} />
                  </Button>
                </HStack>
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
                    isDisabled={item.name.length <= 20}
                    hasArrow
                  >
                    <Box
                      position="relative"
                      width="100%"
                      overflow="hidden"
                      flex={1}
                    >
                      <Text
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
              >
                <Text
                  color={item.archived ? 'text.inactiveButtonText' : 'inherit'}
                  textStyle="cellBody"
                  transition="color 0.3s ease"
                >
                  {item.abbreviation}
                </Text>
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
                    <Portal>
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
                    </Portal>
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
        >
          <Box width={leftColumnWidth} pr={4}>
            <HStack spacing={5}>
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
              <Input
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    name: e.target.value,
                  })
                }
                placeholder={`${title} name`}
                size="sm"
                flex="1"
                maxLength={maxFullNameLength}
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
              onChange={(e) =>
                setNewItem({
                  ...newItem,
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
                onClick={handleAddItem}
                size="sm"
                borderRadius="md"
                p={0}
                transition="background-color 0.2s ease"
              >
                <IoCheckmark size={20} color={theme.colors.gray[600]} />
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                size="sm"
                borderRadius="md"
                p={0}
                transition="background-color 0.2s ease"
              >
                <IoCloseOutline size={20} color={theme.colors.gray[600]} />
              </Button>
            </HStack>
          </Box>
        </Box>
      ) : null}

      {/* Add Button */}
      <Box
        as="button"
        width="100%"
        onClick={() => setIsAddingItem(true)}
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
