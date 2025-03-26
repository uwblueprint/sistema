import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Heading,
  HStack,
  Text,
  useTheme,
  VStack,
} from '@chakra-ui/react';

import CircularProgress from './CircularProgress';

interface TotalAbsencesProps {
  width: string;
  filled: number;
  total: number;
  startYear: string;
  endYear: string;
}

export default function TotalAbsencesCard({
  width,
  filled,
  total,
  startYear,
  endYear,
}: TotalAbsencesProps) {
  const theme = useTheme();

  const percentage = total > 0 ? (filled / total) * 100 : 0;
  const noData = total === 0;

  const filledColor = noData
    ? theme.colors.primaryBlue[50]
    : theme.colors.primaryBlue[300];
  const unfilledColor = noData
    ? theme.colors.primaryBlue[50]
    : theme.colors.neutralGray[200];

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
      <CardBody display="flex" flexDirection="column" overflowY="auto">
        <HStack align="flex-start" justify="space-between" width="100%">
          <HStack align="flex-start" gap="35px">
            <CircularProgress
              value={percentage}
              size={110}
              strokeWidth={24}
              filledColor={filledColor}
              unfilledColor={unfilledColor}
            />
            <Box whiteSpace="nowrap" mt="10px">
              <Text
                fontSize="42.955px"
                fontWeight="500"
                fontStyle="normal"
                lineHeight="normal"
                fontFamily="Poppins"
                color={numColor}
                mb="1"
                isTruncated
              >
                {noData ? 'No Data' : `${filled}/${total}`}
              </Text>
              {!noData && (
                <Text
                  fontSize="22px"
                  lineHeight="normal"
                  fontWeight="400"
                  color={dateColor}
                  isTruncated
                >
                  Sept {startYear} - Aug {endYear}
                </Text>
              )}
            </Box>
            <VStack align="flex-start" pr="30px">
              <HStack>
                <Box
                  w="16px"
                  h="16px"
                  borderRadius="full"
                  bg={theme.colors.neutralGray[200]}
                />
                <Text fontSize="13px" fontStyle="normal" fontWeight="400">
                  Unfilled
                </Text>
              </HStack>
              <HStack>
                <Box
                  w="16px"
                  h="16px"
                  borderRadius="full"
                  bg={theme.colors.primaryBlue[300]}
                />
                <Text fontSize="13px" fontStyle="normal" fontWeight="400">
                  Filled
                </Text>
              </HStack>
            </VStack>
          </HStack>
        </HStack>
      </CardBody>
    </Card>
  );
}
