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
import { MonthlyAbsenceData } from '@utils/types';
import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CustomTooltip } from './CustomTooltip';
import DualColorBar from './DualColourBar';

export default function MonthlyAbsencesCard({
  width,
  monthlyData,
  highestMonthlyAbsence,
}: {
  width: string | number;
  monthlyData: MonthlyAbsenceData[];
  highestMonthlyAbsence: number;
}) {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const filledColor = theme.colors.primaryBlue[300];
  const unfilledColor = theme.colors.neutralGray[200];
  const chartTextColor = theme.colors.text.subtitle;

  const yAxisMax = Math.ceil(highestMonthlyAbsence / 10) * 10;
  const yAxisTicks = Array.from(
    { length: Math.floor(yAxisMax / 5) + 1 },
    (_, i) => i * 5
  );

  const combinedMonthlyData = monthlyData.map((entry) => ({
    ...entry,
    total: entry.filled + entry.unfilled,
  }));

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
        <Heading fontSize="22px" lineHeight="33px" fontWeight={700} pb="13px">
          Monthly Absences
        </Heading>
      </CardHeader>
      <Divider />
      <CardBody display="flex" flexDirection="column">
        <HStack align="flex-start" justify="space-between" gap="4%">
          <Box width="100%" height="110px">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={combinedMonthlyData}
                margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
                onMouseMove={(state) => {
                  if (state.isTooltipActive) {
                    setActiveIndex(state.activeTooltipIndex ?? null);
                  } else {
                    setActiveIndex(null);
                  }
                }}
              >
                <CartesianGrid
                  strokeDasharray="0"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: chartTextColor, fontSize: 12 }}
                  tickMargin={12}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: chartTextColor, fontSize: 12 }}
                  domain={[0, yAxisMax]}
                  ticks={yAxisTicks}
                  tickCount={yAxisTicks.length}
                  interval={0}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'transparent' }}
                />
                <Bar
                  dataKey="total"
                  barSize={28}
                  shape={(props) => (
                    <DualColorBar
                      {...props}
                      filledColor={filledColor}
                      unfilledColor={unfilledColor}
                      isActive={activeIndex === props.index}
                    />
                  )}
                ></Bar>
              </BarChart>
            </ResponsiveContainer>
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
