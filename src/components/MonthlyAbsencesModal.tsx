import {
  Box,
  Card,
  CardBody,
  CardHeader,
  VStack,
  Heading,
  HStack,
  Text,
  CircularProgress,
  Divider,
  useTheme,
  Center,
} from '@chakra-ui/react';

export default function MonthlyAbsencesModal({ width }) {
  const theme = useTheme();

  const filledColor = theme.colors.primaryBlue[300];
  const unfilledColor = theme.colors.neutralGray[200];
  const dateColor = theme.colors.text.subtitle;
  const numColor = theme.colors.text.body;

  return (
    <Card
      width={width}
      borderRadius="lg"
      shadow="sm"
      overflow="hidden"
      bg="white"
      border="1px solid"
      borderColor="neutralGray.300"
      height="100%"
    >
      <CardHeader pb={0} display="flex" alignItems="center">
        <Heading
          fontSize="22px"
          lineHeight="33px"
          fontWeight={700}
          paddingBottom="13px"
        >
          Monthly Absences
        </Heading>
      </CardHeader>
      <Divider />
      <CardBody>
        <HStack align="center" justify="space-between" gap="28px">
          <Box>
            <Text
              fontSize="42.955px"
              fontWeight="500"
              fontStyle="normal"
              lineHeight="normal"
              fontFamily="Poppins"
              color={numColor}
            >
              {5}/{10}
            </Text>
          </Box>

          <VStack
            align="flex-start"
            gap="10px"
            height="43px"
            paddingRight="30px"
            mb="65px"
          >
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
