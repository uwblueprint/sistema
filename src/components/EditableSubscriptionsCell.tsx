import React, { useEffect, useState, useRef } from 'react';
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
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 'auto',
    left: 'auto',
  });

  // Initialize selected subjects from current mailing lists
  useEffect(() => {
    setSelectedSubjectIds(mailingLists.map((list) => list.subjectId));
  }, [mailingLists]);

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

  // Check if there are any changes
  const hasChanges = () => {
    const originalIds = mailingLists.map((list) => list.subjectId).sort();
    const newIds = [...selectedSubjectIds].sort();

    if (originalIds.length !== newIds.length) return true;

    for (let i = 0; i < originalIds.length; i++) {
      if (originalIds[i] !== newIds[i]) return true;
    }

    return false;
  };

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
          // If there are changes, apply them before closing
          if (hasChanges()) {
            onSubscriptionsChange(selectedSubjectIds);
          }
          setIsEditing(false);
          setIsDropdownOpen(false);
          setIsHovered(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [
    isDropdownOpen,
    isEditing,
    hasChanges,
    onSubscriptionsChange,
    selectedSubjectIds,
  ]);

  const handleEditClick = () => {
    if (isEditing) {
      toggleDropdown();
    } else {
      setIsEditing(true);
      setIsDropdownOpen(false);
      setIsHovered(false);
    }
  };

  const toggleDropdown = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
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

  const handleConfirmClick = () => {
    onSubscriptionsChange(selectedSubjectIds);
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    // Reset to original selection
    setSelectedSubjectIds(mailingLists.map((list) => list.subjectId));
    setIsEditing(false);
    setIsHovered(false);
    setIsDropdownOpen(false);
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
      >
        <Wrap spacing={2}>
          {mailingLists.map((list, index) => (
            <WrapItem key={index}>
              <SubjectTag subject={list.subject} />
            </WrapItem>
          ))}
        </Wrap>

        <Box display="flex" alignItems="center" ml={2}>
          {isEditing ? (
            <Icon
              as={isDropdownOpen ? FiChevronUp : FiChevronDown}
              color="neutralGray.600"
              onClick={toggleDropdown}
            />
          ) : (
            isHovered && <Icon as={FiEdit2} color="neutralGray.600" />
          )}
        </Box>
      </Box>

      {isDropdownOpen && (
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
            transform: 'translateY(-100%)', // Move it up by its full height
          }}
        >
          {allSubjects.map((subject) => (
            <Box
              key={subject.id}
              p={2}
              display="flex"
              alignItems="center"
              _hover={{ bg: 'primaryBlue.50' }}
            >
              <Checkbox
                isChecked={selectedSubjectIds.includes(subject.id)}
                onChange={() => handleSubjectChange(subject.id)}
                mr={2}
              />
              <SubjectTag subject={subject} />
            </Box>
          ))}
        </Box>
      )}

      {isEditing && hasChanges() && (
        <Button
          variant="outline"
          onClick={handleConfirmClick}
          position="absolute"
          right={'-70px'}
          size="sm"
          borderRadius="md"
          p={0}
        >
          <IoCheckmark size={20} color="neutralGray.600" />
        </Button>
      )}

      {isEditing && (
        <Button
          variant="outline"
          onClick={handleCancelClick}
          position="absolute"
          right={'-35px'}
          size="sm"
          borderRadius="md"
          p={0}
        >
          <IoCloseOutline size={20} color="neutralGray.600" />
        </Button>
      )}
    </Box>
  );
};

export default EditableSubscriptionsCell;
