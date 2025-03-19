import {
  Box,
  Card,
  CardBody,
  CardHeader,
  VStack,
  Heading,
  HStack,
  Text,
  Divider,
  useTheme,
  Center,
} from '@chakra-ui/react';

import CircularProgress from './CircularProgress';

interface TotalAbsencesProps {
  width: string;
  filled: number;
  total: number;
  startYear: string;
  endYear: string;
}

export default function TotalAbsencesModal({
  width,
  filled,
  total,
  startYear,
  endYear,
}: TotalAbsencesProps) {
  const percentage = (filled / total) * 100;

  const theme = useTheme();

  const filledColor = theme.colors.primaryBlue[300];
  const unfilledColor = theme.colors.neutralGray[200];
  const dateColor = theme.colors.text.subtitle;
  const numColor = theme.colors.text.body;

  return (
    <Card
      width={width}
      height="100%"
      borderRadius="lg"
      shadow="sm"
      overflow="hidden"
      bg="white"
      border="1px solid"
      borderColor="neutralGray.300"
    >
      <CardHeader pb={0} display="flex" alignItems="center">
        <Heading
          fontSize="22px"
          lineHeight="33px"
          fontWeight={700}
          paddingBottom="13px"
        >
          Total Absences
        </Heading>
      </CardHeader>
      <Divider />
      <CardBody>
        <HStack align="left" gap="35px">
          <CircularProgress
            value={percentage}
            size={110}
            strokeWidth={24}
            filledColor={filledColor}
            unfilledColor={unfilledColor}
          />
          <Box>
            <Text
              fontSize="42.955px"
              fontWeight="500"
              fontStyle="normal"
              lineHeight="normal"
              fontFamily="Poppins"
              color={numColor}
              mt="10px"
            >
              {filled}/{total}
            </Text>
            <Text
              fontSize="22px"
              lineHeight="normal"
              fontWeight="400"
              color={dateColor}
            >
              Sept {startYear} - Aug {endYear}
            </Text>
          </Box>

          <VStack align="flex-start" gap="10px" height="43px" mb="65px">
            <HStack>
              <Box
                w="16px"
                h="16px"
                borderRadius="full"
                bg={unfilledColor}
              ></Box>
              <Text fontSize="13px" fontStyle="normal" fontWeight="400">
                Unfilled
              </Text>
            </HStack>
            <HStack>
              <Box w="16px" h="16px" borderRadius="full" bg={filledColor}></Box>
              <Text fontSize="13px" fontStyle="normal" fontWeight="400">
                Filled
              </Text>
            </HStack>
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  );
}
