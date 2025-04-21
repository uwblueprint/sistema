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
  Tooltip,
  WrapItem,
} from '@chakra-ui/react';
import { MailingList, SubjectAPI } from '@utils/types';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>(
    mailingLists
      .filter((list) => !list.subject.archived)
      .map((list) => list.subjectId)
  );
  const [localMailingLists, setLocalMailingLists] = useState<MailingList[]>(
    () =>
      [...mailingLists]
        .filter((list) => !list.subject.archived)
        .sort((a, b) => a.subjectId - b.subjectId)
  );

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

  // Update the state when props change
  useEffect(() => {
    if (!isSaving) {
      const sorted = [...mailingLists]
        .filter((list) => !list.subject.archived)
        .sort((a, b) => a.subjectId - b.subjectId);

      setSelectedSubjectIds(sorted.map((list) => list.subjectId));
      setLocalMailingLists(sorted);
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

  interface SubjectListItemProps {
    subject: SubjectAPI;
    isSelected: boolean;
    onToggle: (id: number) => void;
  }

  const SubjectListItem: React.FC<SubjectListItemProps> = ({
    subject,
    isSelected,
    onToggle,
  }) => {
    const bgColor = subject.colorGroup.colorCodes[1];
    const borderColor = subject.colorGroup.colorCodes[1];

    const textRef = useRef<HTMLDivElement>(null);
    const [isTruncated, setIsTruncated] = useState(false);

    useLayoutEffect(() => {
      const el = textRef.current;
      if (el) {
        setIsTruncated(el.scrollWidth > el.clientWidth);
      }
    }, [subject.name]);

    return (
      <Tooltip
        label={subject.name}
        placement="top"
        openDelay={300}
        isDisabled={!isTruncated}
        hasArrow
      >
        <Flex
          align="center"
          cursor="pointer"
          onClick={() => onToggle(subject.id)}
          px={4}
          py={2.5}
          _hover={{ bg: 'neutralGray.100' }}
        >
          <Checkbox
            isChecked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggle(subject.id);
            }}
            mr={2}
            borderColor={borderColor}
            _checked={{
              '& .chakra-checkbox__control': {
                bg: bgColor,
                borderColor,
              },
            }}
            _hover={{
              '& .chakra-checkbox__control': {
                bg: bgColor,
                borderColor,
                opacity: 0.8,
              },
            }}
          />

          <Box
            flex="1"
            minW={0}
            position="relative"
            overflow="hidden"
            whiteSpace="nowrap"
            sx={{
              ...(isTruncated && {
                maskImage: 'linear-gradient(to right, black 80%, transparent)',
                WebkitMaskImage:
                  'linear-gradient(to right, black 80%, transparent)',
              }),
            }}
          >
            <Text
              ref={textRef}
              noOfLines={1}
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              pr="30px"
              textStyle="label"
            >
              {subject.name}
            </Text>
          </Box>
        </Flex>
      </Tooltip>
    );
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
        gutter={5}
        isLazy
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
          borderColor="neutralGray.300"
          ref={popoverRef}
          width="580px"
          maxWidth="580px"
          zIndex={0}
          mt="2px"
          overflowX="hidden"
        >
          <PopoverBody p={0} maxH="300px" overflowY="auto" overflowX="hidden">
            {sortedSubjects.map((subject) => (
              <SubjectListItem
                key={subject.id}
                subject={subject}
                isSelected={selectedSubjectIds.includes(subject.id)}
                onToggle={handleSubjectChange}
              />
            ))}
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  );
};

export default EditableSubscriptionsCell;
