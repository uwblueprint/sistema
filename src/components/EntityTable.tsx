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
import { Change } from './SystemChangesConfirmationDialog';

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

interface EntityTableProps {
  title: string;
  entityType: 'subject' | 'location';
  items: EntityTableItem[];
  colorGroups?: ColorGroup[];
  itemsInUse: number[];
  handleAddChange: (change: Change) => void;
  maxAbbreviationLength: number;
}

const EntityTable: React.FC<EntityTableProps> = ({
  title,
  entityType,
  items,
  colorGroups = [],
  itemsInUse,
  handleAddChange,
  maxAbbreviationLength,
}) => {
  const COLOR_CODE_INDEX = 1;
  const theme = useTheme();
  const editingRowRef = useRef<HTMLDivElement>(null);

  const [editingItem, setEditingItem] = useState<EntityTableItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState<number | null>(null);
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

    // Store the current editing state
    const currentEditingItem = { ...editingItem };

    // Reset the editing state
    setEditingItem(null);
    setColorPickerOpen(null);

    // Find the original item to compare changes
    const originalItem = items.find((i) => i.id === currentEditingItem.id);
    if (!originalItem) return;

    // Only include fields that have changed
    const changedData: any = {};

    if (originalItem.name !== currentEditingItem.name) {
      changedData.name = currentEditingItem.name;
      changedData.originalName = originalItem.name;
    }

    if (originalItem.abbreviation !== currentEditingItem.abbreviation) {
      changedData.abbreviation = currentEditingItem.abbreviation;
      changedData.originalAbbreviation = originalItem.abbreviation;
    }

    if (
      entityType === 'subject' &&
      originalItem.colorGroupId !== currentEditingItem.colorGroupId
    ) {
      changedData.colorGroupId = currentEditingItem.colorGroupId;
      changedData.originalColorGroupId = originalItem.colorGroupId;
    }

    // Only proceed if there are actual changes
    if (Object.keys(changedData).length > 0) {
      // Check if all changes are reverted to original values
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
          entity: entityType,
          id: currentEditingItem.id!,
          data: changedData,
          displayText: `Updated ${title} "${currentEditingItem.name}"`,
        });
      }
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

    // Create a temporary ID for the new item
    const tempId = -Date.now();

    const itemData: any = {
      name: newItem.name,
      abbreviation: newItem.abbreviation,
    };

    // Add colorGroupId if this is a subject
    if (entityType === 'subject' && newItem.colorGroupId) {
      itemData.colorGroupId = newItem.colorGroupId;
    }

    handleAddChange({
      type: 'add',
      entity: entityType,
      id: tempId,
      data: itemData,
      displayText: `Added ${title} "${newItem.name}"`,
    });

    // Reset form and close it
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
    handleAddChange({
      type: item.archived ? 'unarchive' : 'archive',
      entity: entityType,
      id: item.id,
      data: { archived: !item.archived },
      displayText: `${item.archived ? 'Unarchived' : 'Archived'} ${title} "${item.name}"`,
    });
  };

  const handleDeleteItem = (item: EntityTableItem) => {
    handleAddChange({
      type: 'delete',
      entity: entityType,
      id: item.id,
      displayText: `Deleted ${title} "${item.name}"`,
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
            <Text fontWeight="medium">{title}</Text>
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
                The full {entityType} name
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
                The abbreviated {entityType} name
                <br />
                (max {maxAbbreviationLength} characters)
              </Box>
            </Box>
          </HStack>
        </Box>
      </Box>

      {/* Table Rows */}
      {sortedItems.map((item) => (
        <Box
          p={3}
          borderBottomWidth="1px"
          _last={{ borderBottomWidth: 0 }}
          ref={editingItem?.id === item.id ? editingRowRef : undefined}
          bg={item.archived ? 'neutralGray.100' : 'white'}
          display="flex"
          width="100%"
          role="group"
          key={item.id}
        >
          {editingItem && editingItem.id === item.id ? (
            <>
              <Box width="70%" pl={2}>
                <HStack>
                  {entityType === 'subject' && (
                    <Box position="relative">
                      <Circle
                        size="24px"
                        bg={
                          editingItem.colorGroup?.colorCodes[COLOR_CODE_INDEX]
                        }
                        cursor="pointer"
                        onClick={() => setColorPickerOpen(item.id)}
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
                  {entityType === 'subject' && (
                    <Circle
                      size="24px"
                      bg={item.colorGroup?.colorCodes[COLOR_CODE_INDEX]}
                    />
                  )}
                  {item.archived && (
                    <LuArchive
                      color={theme.colors.text.inactiveButtonText}
                      size={16}
                    />
                  )}
                  <Tooltip
                    label={item.name}
                    placement="top"
                    openDelay={300}
                    isDisabled={item.name.length <= 20}
                  >
                    <Box
                      position="relative"
                      width="100%"
                      maxWidth="170px"
                      overflow="hidden"
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
                      />
                    </Box>
                  </Tooltip>
                </HStack>
              </Box>
              <Box width="30%" display="flex" justifyContent="space-between">
                <Text
                  color={item.archived ? 'text.inactiveButtonText' : 'inherit'}
                >
                  {item.abbreviation}
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
                        onClick={() => handleEditItem(item)}
                      >
                        Edit
                      </MenuItem>
                      <MenuItem
                        icon={<IoArchiveOutline />}
                        onClick={() => handleArchiveItem(item)}
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
                      >
                        <MenuItem
                          icon={<IoTrashOutline />}
                          onClick={() => handleDeleteItem(item)}
                          color="red.500"
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
        >
          <Box width="70%" pl={2}>
            <HStack>
              {entityType === 'subject' && (
                <Box position="relative">
                  <Circle
                    size="24px"
                    bg={
                      colorGroups.find(
                        (cg) => cg.name === newItem.colorGroup?.name
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
        borderTopWidth={items.length > 0 ? '1px' : '0'}
        bg="gray.50"
      >
        <Button
          leftIcon={<IoAdd />}
          size="sm"
          variant="ghost"
          onClick={() => setIsAddingItem(true)}
        >
          Add
        </Button>
      </HStack>
    </Box>
  );
};

export default EntityTable;
