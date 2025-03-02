import React, { useEffect, useState } from 'react';
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
import { MailingList, Subject } from '../types/apiTypes';

interface EditableSubscriptionsCellProps {
  mailingLists: MailingList[];
  allSubjects: Subject[];
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

  // Initialize selected subjects from current mailing lists
  useEffect(() => {
    setSelectedSubjectIds(mailingLists.map((list) => list.subject.id));
  }, [mailingLists]);

  const handleEditClick = () => {
    setIsEditing(true);
    setIsDropdownOpen(false);
    setIsHovered(false);
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
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
    setSelectedSubjectIds(mailingLists.map((list) => list.subject.id));
    setIsEditing(false);
    setIsHovered(false);
    setIsDropdownOpen(false);
  };

  // Check if there are any changes
  const hasChanges = () => {
    const originalIds = mailingLists.map((list) => list.subject.id).sort();
    const newIds = [...selectedSubjectIds].sort();

    if (originalIds.length !== newIds.length) return true;

    for (let i = 0; i < originalIds.length; i++) {
      if (originalIds[i] !== newIds[i]) return true;
    }

    return false;
  };

  return (
    <Box
      position="relative"
      display="inline-flex"
      alignItems="center"
      width="100%"
      onMouseEnter={() => !isEditing && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
        <Wrap spacing={2} width="100%">
          {mailingLists.map((list, index) => (
            <WrapItem key={index}>
              <Tag
                size="lg"
                variant="subtle"
                bg={list.subject.colorGroup.colorCodes[3]}
              >
                <TagLabel>
                  <Text
                    color={list.subject.colorGroup.colorCodes[0]}
                    fontWeight="600"
                    textStyle="label"
                  >
                    {list.subject.name}
                  </Text>
                </TagLabel>
              </Tag>
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
          position="absolute"
          top="38px"
          left="0"
          bg="white"
          border="1px solid"
          borderColor="neutralGray.300"
          borderRadius="md"
          shadow="md"
          zIndex="10"
          width="250px"
          p={2}
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
              <Tag
                size="md"
                variant="subtle"
                bg={subject.colorGroup.colorCodes[3]}
              >
                <TagLabel>
                  <Text
                    color={subject.colorGroup.colorCodes[0]}
                    fontWeight="600"
                    textStyle="label"
                  >
                    {subject.name}
                  </Text>
                </TagLabel>
              </Tag>
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
