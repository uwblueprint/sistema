import {
  Box,
  Checkbox,
  Flex,
  Icon,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Tag,
  TagLabel,
  Text,
  WrapItem,
} from '@chakra-ui/react';
import { MailingList, SubjectAPI } from '@utils/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiEdit2 } from 'react-icons/fi';

interface SubjectTagProps {
  subject: {
    id: number;
    name: string;
    colorGroup: {
      colorCodes: string[];
    };
  };
}

const SubjectTag: React.FC<SubjectTagProps> = ({ subject }) => (
  <Tag height="28px" variant="subtle" bg={subject.colorGroup.colorCodes[3]}>
    <TagLabel>
      <Text
        color={subject.colorGroup.colorCodes[0]}
        textStyle="label"
        whiteSpace="nowrap"
        overflow="hidden"
      >
        {subject.name}
      </Text>
    </TagLabel>
  </Tag>
);

interface EditableSubscriptionsCellProps {
  mailingLists: MailingList[];
  allSubjects: SubjectAPI[];
  onSubscriptionsChange: (subjectIds: number[]) => void;
}

const EditableSubscriptionsCell: React.FC<EditableSubscriptionsCellProps> = ({
  mailingLists,
  allSubjects,
  onSubscriptionsChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);
  const [localMailingLists, setLocalMailingLists] =
    useState<MailingList[]>(mailingLists);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [closeTriggeredByTriggerClick, setCloseTriggeredByTriggerClick] =
    useState(false);
  const [popoverClosingByOutsideClick, setPopoverClosingByOutsideClick] =
    useState(false);

  // Create a map of subjects by ID for quick lookup
  const subjectsById = useMemo(() => {
    const map: Record<number, SubjectAPI> = {};
    allSubjects.forEach((subject) => {
      map[subject.id] = subject;
    });
    return map;
  }, [allSubjects]);

  // Get sorted subjects for dropdown display
  const sortedSubjects = useMemo(() => {
    return [...allSubjects]
      .filter((subject) => !subject.archived) // Filter out archived subjects
      .sort((a, b) => a.id - b.id); // Now we only need to sort by ID since all subjects are unarchived
  }, [allSubjects]);

  // Define saveSubscriptions with useCallback so it can be used in dependency arrays
  const saveSubscriptions = useCallback(() => {
    // Don't save if nothing has changed
    const currentIds = new Set(mailingLists.map((list) => list.subjectId));
    const selectedIds = new Set(selectedSubjectIds);

    // Check if the sets are identical - converted to arrays to avoid linter error
    const currentIdsArray = Array.from(currentIds);
    if (
      currentIds.size === selectedIds.size &&
      currentIdsArray.every((id) => selectedIds.has(id))
    ) {
      return;
    }

    setIsSaving(true);
    // Initiate the save but don't wait for it to complete
    Promise.resolve(onSubscriptionsChange(selectedSubjectIds)).finally(() => {
      setIsSaving(false);
    });
  }, [mailingLists, selectedSubjectIds, onSubscriptionsChange]);

  // Initialize selected subjects from current mailing lists
  useEffect(() => {
    if (!isSaving) {
      setSelectedSubjectIds(
        mailingLists
          .filter((list) => !list.subject.archived)
          .map((list) => list.subjectId)
      );
      setLocalMailingLists(
        mailingLists.filter((list) => !list.subject.archived)
      );
    }
  }, [mailingLists, isSaving]);

  // Update local mailing lists when selection changes
  useEffect(() => {
    // Create new mailing lists based on selected subject IDs
    const newMailingListsUnsorted = selectedSubjectIds
      .map((id) => {
        // Try to find existing mailing list first
        const existingList = mailingLists.find((list) => list.subjectId === id);
        if (existingList && !existingList.subject.archived) return existingList;

        // If not, create a new one based on the subject from our full subjects list
        const subject = subjectsById[id];

        if (!subject || subject.archived) return null;

        return {
          subjectId: subject.id,
          subject: subject,
        } as MailingList;
      })
      .filter(Boolean) as MailingList[];

    // Sort the new mailing lists by ID
    const sortedMailingLists = [...newMailingListsUnsorted].sort(
      (a, b) => a.subjectId - b.subjectId
    );

    setLocalMailingLists(sortedMailingLists);
  }, [selectedSubjectIds, mailingLists, subjectsById]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If popover is open, the popover's onClose handler will handle it
      // Only handle clicks outside when popover is already closed and we're in edit mode
      if (
        isEditing &&
        !isPopoverOpen &&
        !popoverClosingByOutsideClick && // Ignore clicks when popover is being closed
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsEditing(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, isPopoverOpen, popoverClosingByOutsideClick]);

  // Separate edit icon click handler
  const handleEditIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Only trigger if not already in edit mode
    if (!isEditing) {
      setIsEditing(true);
      setIsHovered(false);
    }
  };

  // Main cell area click handler
  const handleEditAreaClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // If already in edit mode, toggle popover
    if (isEditing) {
      if (isPopoverOpen) {
        // Close the popover but keep edit mode active
        setCloseTriggeredByTriggerClick(true);
        setIsPopoverOpen(false);
      } else {
        // Open the popover
        setIsPopoverOpen(true);
      }
    } else {
      // First click on cell, just enter edit mode
      setIsEditing(true);
      setIsHovered(false);
    }
  };

  const handleSubjectChange = (subjectId: number, e?: React.MouseEvent) => {
    // Prevent this click from triggering document clicks
    e?.stopPropagation();

    setSelectedSubjectIds((prev) => {
      if (prev.includes(subjectId)) {
        return prev.filter((id) => id !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
  };

  const handleClose = () => {
    // Track that popover is being closed
    const wasPopoverOpen = isPopoverOpen;

    if (wasPopoverOpen && !closeTriggeredByTriggerClick) {
      // This is a close from clicking outside - set flag
      setPopoverClosingByOutsideClick(true);

      // Clear the flag after a short delay to allow the click event to propagate
      setTimeout(() => {
        setPopoverClosingByOutsideClick(false);
      }, 500);
    }

    setIsPopoverOpen(false);

    setTimeout(() => {
      // Save the subscriptions after the popover has closed
      saveSubscriptions();
    }, 300);

    // If the close wasn't triggered by clicking on the trigger area,
    // exit editing mode (outside click)
    if (!closeTriggeredByTriggerClick) {
      setIsEditing(false);
    }

    // Reset the flag for next time
    setCloseTriggeredByTriggerClick(false);
  };

  return (
    <Box
      position="relative"
      display="inline-flex"
      alignItems="center"
      width="100%"
      onMouseEnter={() => !isEditing && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ref={containerRef}
    >
      <Popover
        isOpen={isPopoverOpen}
        onClose={handleClose}
        placement="bottom-start"
        autoFocus={false}
        closeOnBlur={true}
        gutter={0}
      >
        <PopoverTrigger>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            cursor="pointer"
            onClick={handleEditAreaClick}
            bg={
              isEditing
                ? 'primaryBlue.50'
                : isHovered
                  ? 'neutralGray.100'
                  : 'transparent'
            }
            p={2}
            borderRadius="md"
            width="100%"
            transition="background-color 0.3s ease-in-out"
            ref={triggerRef}
          >
            <Flex gap={2} wrap="nowrap">
              {localMailingLists.map((list, index) => (
                <WrapItem key={`${list.subjectId}-${index}`}>
                  <SubjectTag subject={list.subject} />
                </WrapItem>
              ))}
            </Flex>

            <Box
              display="flex"
              alignItems="center"
              ml={2}
              onClick={isEditing ? handleEditAreaClick : handleEditIconClick}
            >
              {isEditing ? (
                <Icon
                  as={isPopoverOpen ? FiChevronUp : FiChevronDown}
                  color="neutralGray.600"
                />
              ) : (
                <Icon
                  as={FiEdit2}
                  color="neutralGray.600"
                  opacity={isHovered ? 1 : 0}
                  transition="opacity 0.3s ease-in-out"
                />
              )}
            </Box>
          </Box>
        </PopoverTrigger>

        <PopoverContent
          width={
            triggerRef.current?.offsetWidth
              ? `${triggerRef.current.offsetWidth}px`
              : '100%'
          }
          borderColor="neutralGray.300"
          ref={popoverRef}
          zIndex={1}
          mt="2px"
        >
          <PopoverBody p={0} maxHeight="300px" overflowY="auto" zIndex={1}>
            {sortedSubjects.map((subject) => {
              const isSelected = selectedSubjectIds.includes(subject.id);
              const bgColor = subject.colorGroup.colorCodes[1];
              const borderColor = subject.colorGroup.colorCodes[1];

              return (
                <Box
                  key={subject.id}
                  p={2.5}
                  pl={4}
                  display="flex"
                  alignItems="center"
                  _hover={{ bg: 'neutralGray.100' }}
                  onClick={(e) => handleSubjectChange(subject.id, e)}
                  cursor="pointer"
                >
                  <Checkbox
                    isChecked={isSelected}
                    onChange={(e) => {
                      e.nativeEvent.stopPropagation();
                      handleSubjectChange(subject.id);
                    }}
                    mr={2}
                    _checked={{
                      '& .chakra-checkbox__control': {
                        bg: bgColor,
                        borderColor: borderColor,
                      },
                    }}
                    _hover={{
                      '& .chakra-checkbox__control': {
                        borderColor: borderColor,
                        bg: bgColor,
                        opacity: 0.7,
                      },
                    }}
                    borderColor={borderColor}
                  />
                  <Text textStyle="label">{subject.name}</Text>
                </Box>
              );
            })}
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  );
};

export default EditableSubscriptionsCell;
