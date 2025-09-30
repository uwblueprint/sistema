import {
  Box,
  Divider,
  Input,
  InputGroup,
  InputRightElement,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
} from '@chakra-ui/react';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { useCustomToast } from '../../CustomToast';

export type Option = { name: string; id: number };

interface InputDropdownProps {
  labelledBy: string;
  label: string;
  type: 'location' | 'subject';
  onChange: (value: Option | null) => void;
  defaultValueId?: number;
}

export const InputDropdown: React.FC<InputDropdownProps> = ({
  labelledBy,
  label,
  type,
  onChange,
  defaultValueId,
}) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const showToast = useCustomToast();
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/formDropdown');
      if (!res.ok) {
        let errorMessage = `Failed to fetch ${type} options: `;
        try {
          const errorData = await res.json();
          errorMessage += errorData?.error || res.statusText || 'Unknown error';
        } catch {
          errorMessage += res.statusText || 'Unknown error';
        }

        console.error(errorMessage);
        showToastRef.current({
          status: 'error',
          description: errorMessage,
        });
        return;
      }

      const data = await res.json();
      setOptions(
        type === 'location' ? data.locationOptions : data.subjectOptions
      );
    } catch (error: any) {
      const errorMessage = error?.message
        ? `Failed to fetch ${type} options: ${error.message}`
        : `Failed to fetch ${type} options.`;
      console.error(errorMessage);
      showToastRef.current({
        status: 'error',
        description: errorMessage,
      });
    }
  }, [type]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (
      defaultValueId &&
      options.length > 0 &&
      selectedOption?.id !== defaultValueId
    ) {
      const match = options.find((opt) => opt.id === defaultValueId);
      if (match) {
        setSelectedOption(match);
        onChange(match);
      }
    }
  }, [options, defaultValueId, selectedOption, onChange]);

  const handleOptionSelect = (option: Option) => {
    setSelectedOption(option);
    onChange(option);
    setIsOpen(false);
  };

  return (
    <Popover
      isOpen={isOpen}
      onOpen={() => {
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }}
      onClose={() => setIsOpen(false)}
      isLazy
    >
      <PopoverTrigger>
        <InputGroup>
          <Input
            ref={inputRef}
            cursor="pointer"
            textAlign="left"
            pr="2.5rem"
            placeholder={`Please select ${label}`}
            value={selectedOption ? selectedOption.name : ''}
            readOnly
            _focusVisible={{ outline: 'none' }}
            aria-labelledby={labelledBy}
          />
          <InputRightElement pointerEvents="none">
            {isOpen ? <IoChevronUp /> : <IoChevronDown />}
          </InputRightElement>
        </InputGroup>
      </PopoverTrigger>

      <PopoverContent
        width="300px"
        mt="-5px"
        borderRadius="md"
        overflow="hidden"
        border="1px solid"
        borderColor="neutralGray.300"
      >
        <PopoverArrow />
        <PopoverBody p={0}>
          {options.map((option, index) => (
            <Fragment key={option.id}>
              <Box
                onClick={() => handleOptionSelect(option)}
                sx={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  bg:
                    selectedOption?.id === option.id
                      ? 'primaryBlue.50'
                      : 'transparent',
                  _hover: { bg: 'neutralGray.100' },
                  _active: { bg: 'neutralGray.300' },
                }}
              >
                <Text textStyle="subtitle">{option.name}</Text>
              </Box>
              {index < options.length - 1 && (
                <Divider borderColor="neutralGray.300" opacity={1} />
              )}
            </Fragment>
          ))}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
