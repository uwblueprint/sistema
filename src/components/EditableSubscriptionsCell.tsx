import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Icon,
  Tag,
  TagLabel,
  Text,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { FiChevronDown, FiChevronUp, FiEdit2 } from 'react-icons/fi';
import { IoCheckmark, IoCloseOutline } from 'react-icons/io5';
import { MailingList, SubjectAPI } from '@utils/types';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDropdownClosing, setIsDropdownClosing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);
  const [localMailingLists, setLocalMailingLists] =
    useState<MailingList[]>(mailingLists);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 'auto',
    left: 'auto',
  });
  const [isSaving, setIsSaving] = useState(false);

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
    return [...allSubjects].sort((a, b) => {
      // First sort by archived status (unarchived first)
      if (a.archived !== b.archived) {
        return a.archived ? 1 : -1;
      }
      // Then sort by ID
      return a.id - b.id;
    });
  }, [allSubjects]);

  // Initialize selected subjects from current mailing lists
  useEffect(() => {
    if (!isSaving) {
      setSelectedSubjectIds(mailingLists.map((list) => list.subjectId));
      setLocalMailingLists(mailingLists);
    }
  }, [mailingLists, isSaving]);

  // Update local mailing lists when selection changes
  useEffect(() => {
    // Create new mailing lists based on selected subject IDs
    const newMailingListsUnsorted = selectedSubjectIds
      .map((id) => {
        // Try to find existing mailing list first
        const existingList = mailingLists.find((list) => list.subjectId === id);
        if (existingList) return existingList;

        // If not, create a new one based on the subject from our full subjects list
        const subject = subjectsById[id];

        if (!subject) return null;

        return {
          subjectId: subject.id,
          subject: subject,
        } as MailingList;
      })
      .filter(Boolean) as MailingList[];

    // Sort the new mailing lists by archived status and ID
    const sortedMailingLists = [...newMailingListsUnsorted].sort((a, b) => {
      // First sort by archived status (unarchived first)
      if (a.subject.archived !== b.subject.archived) {
        return a.subject.archived ? 1 : -1;
      }
      // Then sort by ID
      return a.subjectId - b.subjectId;
    });

    setLocalMailingLists(sortedMailingLists);
  }, [selectedSubjectIds, mailingLists, subjectsById]);

  // Update dropdown position when it opens
  useEffect(() => {
    if (isDropdownOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: `${rect.top - 10}px`, // Position above the row with a small gap
        left: `${rect.left}px`,
      });
    }
  }, [isDropdownOpen]);

  // Handle clicks outside the component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen || isEditing) {
        const target = event.target as Node;
        const isOutsideDropdown =
          dropdownRef.current && !dropdownRef.current.contains(target);
        const isOutsideContainer =
          containerRef.current && !containerRef.current.contains(target);

        if (isOutsideDropdown && isOutsideContainer) {
          // Start closing animation
          setIsDropdownClosing(true);

          // Actually close the dropdown after animation completes
          setTimeout(() => {
            setIsEditing(false);
            setIsDropdownOpen(false);
            setIsDropdownClosing(false);
            setIsHovered(false);

            // Save changes in the background
            saveSubscriptions();
          }, 300);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isEditing, selectedSubjectIds]);

  const saveSubscriptions = () => {
    // Don't save if nothing has changed
    const currentIds = new Set(mailingLists.map((list) => list.subjectId));
    const selectedIds = new Set(selectedSubjectIds);

    // Check if the sets are identical - converted to arrays to avoid linter error
    const currentIdsArray = Array.from(currentIds);
    const selectedIdsArray = Array.from(selectedIds);
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
  };

  const handleEditClick = () => {
    if (isEditing) {
      // Immediately close dropdown
      setIsDropdownOpen(false);

      // If dropdown was open, save changes
      if (isDropdownOpen) {
        saveSubscriptions();
      }
    } else {
      setIsEditing(true);
      setIsDropdownOpen(false);
      setIsHovered(false);
    }
  };

  const toggleDropdown = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isDropdownOpen) {
      // Start closing animation
      setIsDropdownClosing(true);

      // Actually close the dropdown after animation completes
      setTimeout(() => {
        setIsDropdownOpen(false);
        setIsDropdownClosing(false);

        // Save changes in the background
        saveSubscriptions();
      }, 300);
    } else {
      setIsDropdownOpen(true);
    }
  };

  const handleSubjectChange = (subjectId: number) => {
    setSelectedSubjectIds((prev) => {
      if (prev.includes(subjectId)) {
        return prev.filter((id) => id !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
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
      sx={{
        '@keyframes slideUp': {
          '0%': {
            opacity: 0,
            transform: 'translateY(-90%)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(-100%)',
          },
        },
        '@keyframes slideDown': {
          '0%': {
            opacity: 1,
            transform: 'translateY(-100%)',
          },
          '100%': {
            opacity: 0,
            transform: 'translateY(-90%)',
          },
        },
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        cursor="pointer"
        onClick={handleEditClick}
        bg={isEditing ? 'primaryBlue.50' : 'transparent'}
        p={2}
        borderRadius="md"
        width="100%"
        transition="background-color 0.3s ease-in-out"
      >
        <Wrap spacing={2}>
          {localMailingLists.map((list, index) => (
            <WrapItem key={`${list.subjectId}-${index}`}>
              <SubjectTag subject={list.subject} />
            </WrapItem>
          ))}
        </Wrap>

        <Box display="flex" alignItems="center" ml={2}>
          {isEditing ? (
            <Box
              transform={isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
              transition="transform 0.3s ease-in-out"
            >
              <Icon
                as={FiChevronDown}
                color="neutralGray.600"
                onClick={toggleDropdown}
              />
            </Box>
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

      {(isDropdownOpen || isDropdownClosing) && (
        <Box
          position="fixed" // Allows it to appear above other elements
          bg="white"
          border="1px solid"
          borderColor="neutralGray.300"
          borderRadius="md"
          shadow="md"
          zIndex="10"
          width="250px"
          p={2}
          maxHeight="300px"
          overflowY="auto"
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
          }}
          transform="translateY(-100%)"
          animation={
            isDropdownClosing
              ? 'slideDown 0.3s ease-in-out'
              : 'slideUp 0.3s ease-in-out'
          }
        >
          {sortedSubjects.map((subject) => {
            const isSelected = selectedSubjectIds.includes(subject.id);

            return (
              <Box
                key={subject.id}
                p={2}
                display="flex"
                alignItems="center"
                _hover={{ bg: 'primaryBlue.50' }}
                transition="all 0.3s ease"
                borderRadius="md"
                bg="transparent"
              >
                <Checkbox
                  isChecked={isSelected}
                  onChange={() => handleSubjectChange(subject.id)}
                  mr={2}
                  sx={{
                    '.chakra-checkbox__control': {
                      transition: 'all 0.3s ease',
                    },
                    '.chakra-checkbox__label': {
                      transition: 'all 0.3s ease',
                    },
                  }}
                />
                <Box>
                  <SubjectTag subject={subject} />
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default EditableSubscriptionsCell;
