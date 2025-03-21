'use client';

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
} from '@chakra-ui/react';
import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
  type TooltipProps,
} from 'recharts';
import { MonthlyAbsenceData } from '@utils/types';

const CustomTooltip = ({
  active,
  payload,
  coordinate,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const filled =
      payload.find((entry) => entry.dataKey === 'filled')?.value || 0;
    const unfilled =
      payload.find((entry) => entry.dataKey === 'unfilled')?.value || 0;
    const total = filled + unfilled;

    return (
      <Box
        position="absolute"
        left={`${coordinate?.x}px`}
        width="60px"
        transform="translateX(-50%) translateY(-80%)"
        bg="#0468C1"
        color="white"
        px="8px"
        py="4px"
        borderRadius="md"
        fontSize="14px"
        fontWeight="300"
        textAlign="center"
        zIndex={1}
        _after={{
          content: '""',
          position: 'absolute',
          bottom: '-5px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid #0468C1',
        }}
      >
        {filled}/{total}
      </Box>
    );
  }
  return null;
};

export default function MonthlyAbsencesModal({
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
                data={monthlyData}
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
                  dataKey="filled"
                  stackId="a"
                  fill={filledColor}
                  barSize={28}
                >
                  {monthlyData.map((entry, index) => (
                    <Cell
                      key={`cell-filled-${index}`}
                      fill={filledColor}
                      style={{
                        filter:
                          activeIndex === index
                            ? 'drop-shadow(0px 4px 6px rgba(0,0,0,0.2))'
                            : 'none',
                      }}
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="unfilled"
                  stackId="a"
                  fill={unfilledColor}
                  barSize={28}
                >
                  {monthlyData.map((entry, index) => (
                    <Cell
                      key={`cell-unfilled-${index}`}
                      fill={unfilledColor}
                      style={{
                        filter:
                          activeIndex === index
                            ? 'drop-shadow(0px 4px 6px rgba(0,0,0,0.2))'
                            : 'none',
                      }}
                    />
                  ))}
                </Bar>
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
