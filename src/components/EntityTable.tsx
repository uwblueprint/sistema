import React, { useRef, useState, useMemo } from 'react';
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
  Spacer,
  Icon,
} from '@chakra-ui/react';
import {
  IoEllipsisHorizontal,
  IoAdd,
  IoCheckmark,
  IoCloseOutline,
  IoBookOutline,
  IoLinkOutline,
} from 'react-icons/io5';
import { FiType, FiArchive, FiMapPin, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { LuInfo } from 'react-icons/lu';

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
  colorGroups?: ColorGroup[];
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
  colorGroups = [],
  itemsInUse,
  handleUpdateEntity,
  maxAbbreviationLength,
  maxFullNameLength,
  leftColumnWidth = '60%', // Default to 60% if not specified
}) => {
  const COLOR_CODE_INDEX = 1;
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

    handleUpdateEntity(updatedItem);
  };

  const handleDeleteItem = (item: EntityTableItem) => {
    // Log the item being deleted
    console.log(`Deleting ${entityType} with ID: ${item.id}`, item);

    // Mark item for deletion
    handleUpdateEntity(null, item.id);
  };

  return (
    <Box borderWidth="1px" borderRadius="md" overflow="hidden">
      {/* Table Header */}
      <Box
        p={4}
        bg="gray.50"
        borderBottomWidth="1px"
        display="flex"
        width="100%"
      >
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
                  <Box mt={3} bg="blue.50" p={4} borderRadius="md">
                    <HStack spacing={2}>
                      <Text fontWeight="bold" color="blue.800" fontSize="md">
                        Strings & Orch
                      </Text>
                      <Spacer />
                      <Icon as={IoLinkOutline} color="blue.300" boxSize={5} />
                    </HStack>
                    <Text color="gray.600" mt={1} fontSize="md">
                      Yorkwood
                    </Text>
                  </Box>
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
                                onClick={() => {
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
                        transition="transform 0.2s ease"
                        _hover={{ transform: 'scale(1.1)' }}
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
                  className="menu-button"
                  opacity={openMenuId === item.id ? '1' : '0'}
                  _groupHover={{ opacity: '1' }}
                  transition="opacity 0.3s ease"
                >
                  <Menu
                    isOpen={openMenuId === item.id}
                    onOpen={() => setOpenMenuId(item.id)}
                    onClose={() => setOpenMenuId(null)}
                  >
                    <MenuButton
                      as={IconButton}
                      aria-label="Options"
                      icon={<IoEllipsisHorizontal />}
                      variant="ghost"
                      size="sm"
                      transition="opacity 0.2s ease"
                    />
                    <MenuList minW="120px">
                      <MenuItem
                        icon={
                          <FiEdit2
                            color={theme.colors.neutralGray[600]}
                            size={15}
                          />
                        }
                        onClick={() => handleEditItem(item)}
                        transition="background-color 0.2s ease"
                        textStyle="label"
                        color="body"
                        py={2}
                      >
                        Edit
                      </MenuItem>
                      <MenuItem
                        icon={
                          <FiArchive
                            color={theme.colors.neutralGray[600]}
                            size={15}
                          />
                        }
                        onClick={() => handleArchiveItem(item)}
                        transition="background-color 0.2s ease"
                        textStyle="label"
                        color="body"
                        py={2}
                      >
                        {item.archived ? 'Unarchive' : 'Archive'}
                      </MenuItem>
                      <Tooltip
                        label={
                          itemsInUse.includes(item.id)
                            ? `Cannot delete ${entityType} because it is used in existing absences`
                            : ''
                        }
                        isDisabled={!itemsInUse.includes(item.id)}
                        hasArrow
                      >
                        <MenuItem
                          icon={
                            <FiTrash2
                              color={theme.colors.neutralGray[600]}
                              size={15}
                            />
                          }
                          onClick={() => handleDeleteItem(item)}
                          isDisabled={itemsInUse.includes(item.id)}
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
                          transition="background-color 0.2s ease"
                          textStyle="label"
                          color="body"
                          py={2}
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

      {/* Add New Item Row */}
      {isAddingItem ? (
        <Box
          p={3}
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
        >
          <Box width={leftColumnWidth} pl={2}>
            <HStack>
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
                            onClick={() => {
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
        _hover={{ bg: 'gray.50' }}
        transition="background-color 0.2s ease"
        textAlign="left"
        borderTopWidth={items.length > 0 ? '1px' : '0'}
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
