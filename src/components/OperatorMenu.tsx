import {
  Box,
  Button,
  Divider,
  Icon,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { IoChevronDownOutline, IoChevronUpOutline } from 'react-icons/io5';

export type ComparisonOperator = 'greater_than' | 'less_than' | 'equal_to';

interface OperatorMenuProps {
  selectedOperator: ComparisonOperator;
  onOperatorChange: (operator: ComparisonOperator) => void;
  getOperatorLabel: (operator: ComparisonOperator) => string;
}

const OperatorMenu: React.FC<OperatorMenuProps> = ({
  selectedOperator,
  onOperatorChange,
  getOperatorLabel,
}) => {
  const [operatorMenuOpen, setOperatorMenuOpen] = useState(false);
  const operatorMenuRef = useRef(null);

  return (
    <Box position="relative" width="160px" ref={operatorMenuRef}>
      <Popover
        isOpen={operatorMenuOpen}
        onClose={() => setOperatorMenuOpen(false)}
        placement="bottom-start"
      >
        <PopoverTrigger>
          <Button
            variant="outline"
            size="sm"
            width="full"
            bgColor="neutralGray.100"
            borderWidth={0}
            onClick={() => setOperatorMenuOpen(!operatorMenuOpen)}
            rightIcon={
              <Icon
                as={
                  operatorMenuOpen ? IoChevronUpOutline : IoChevronDownOutline
                }
                boxSize={4}
                color={'text.subtitle'}
              />
            }
            justifyContent="space-between"
          >
            <Text textStyle="cellBody" fontSize="12px">
              {getOperatorLabel(selectedOperator || 'greater_than')}
            </Text>
          </Button>
        </PopoverTrigger>

        <PopoverContent width="160px" borderRadius="md" boxShadow="md">
          <PopoverBody p={0}>
            <VStack align="stretch" spacing={0} divider={<Divider />}>
              {(
                [
                  'greater_than',
                  'less_than',
                  'equal_to',
                ] as ComparisonOperator[]
              ).map((operator, index, arr) => (
                <Box
                  key={operator}
                  p={2}
                  cursor="pointer"
                  _hover={{ bg: 'neutralGray.100' }}
                  onClick={() => {
                    onOperatorChange(operator);
                    setOperatorMenuOpen(false);
                  }}
                  bg={
                    selectedOperator === operator ? 'primaryBlue.50' : 'white'
                  }
                  borderRadius={
                    index === 0
                      ? 'md md 0 0'
                      : index === arr.length - 1
                        ? '0 0 md md'
                        : '0'
                  }
                >
                  <Text fontSize="12px" textStyle="label">
                    {operator === 'greater_than'
                      ? 'Greater than'
                      : operator === 'less_than'
                        ? 'Less than'
                        : 'Equal to'}
                  </Text>
                </Box>
              ))}
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  );
};

export default OperatorMenu;
