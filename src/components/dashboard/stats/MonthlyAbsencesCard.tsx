import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Divider,
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
  const unfilledColor = theme.colors.neutralGray[300];
  const chartTextColor = theme.colors.text.subtitle;

  const yAxisBuffer = 1;
  const rawMax = highestMonthlyAbsence + yAxisBuffer;

  const maxTicks = 5;

  let yAxisStep = Math.ceil(rawMax / maxTicks);
  if (yAxisStep > 5) {
    yAxisStep = Math.ceil(yAxisStep / 5) * 5;
  }

  yAxisStep = Math.max(yAxisStep, 1);

  const yAxisMax = Math.ceil(rawMax / yAxisStep) * yAxisStep;

  const yAxisTicks = Array.from(
    { length: Math.floor(yAxisMax / yAxisStep) + 1 },
    (_, i) => i * yAxisStep
  );

  const combinedMonthlyData = monthlyData.map((entry) => ({
    month: entry.month,
    filled: entry.filled,
    unfilled: entry.unfilled,
    total: entry.filled + entry.unfilled,
  }));

  return (
    <Card
      width={width}
      minWidth={'210px'}
      borderRadius="lg"
      shadow="sm"
      overflow="hidden"
      bg="white"
      border="1px solid"
      borderColor="neutralGray.300"
      height="100%"
    >
      <CardHeader py="14px" display="flex" alignItems="center">
        <Text textStyle="h2" fontSize="18px" fontWeight={700} lineHeight="33px">
          Monthly Absences
        </Text>
      </CardHeader>
      <Divider borderColor="neutralGray.300" opacity={1} />
      <CardBody display="flex" flexDirection="column">
        <HStack align="flex-start" justify="space-between" gap="35px">
          <Box flex="1" height="110px">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={combinedMonthlyData}
                margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
                onMouseMove={(state) => {
                  const newIndex = Number(state?.activeTooltipIndex);
                  setActiveIndex(!isNaN(newIndex) ? newIndex : null);
                }}
              >
                <CartesianGrid
                  stroke={theme.colors.neutralGray[300]}
                  strokeWidth={1}
                  horizontal
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
                <Tooltip<number, string>
                  content={(props) => <CustomTooltip {...props} />}
                  cursor={{ fill: 'transparent' }}
                />
                <Bar
                  dataKey="total"
                  barSize={28}
                  shape={(props) => {
                    return (
                      <DualColorBar
                        key={props.index}
                        {...props}
                        filledColor={filledColor}
                        unfilledColor={'#D9D9D9'}
                        isActive={activeIndex === props.index}
                      />
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <VStack align="flex-start" pr="10px">
            <HStack>
              <Box w="16px" h="16px" borderRadius="full" bg={unfilledColor} />
              <Text color="text.body" textStyle="subtitle">
                Unfilled
              </Text>
            </HStack>
            <HStack>
              <Box w="16px" h="16px" borderRadius="full" bg={filledColor} />
              <Text color="text.body" textStyle="subtitle">
                Filled
              </Text>
            </HStack>
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  );
}
