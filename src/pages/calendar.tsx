import React, { useState } from 'react';
import {
  EventApi,
  DateSelectArg,
  EventClickArg,
  EventContentArg,
  formatDate,
} from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { INITIAL_EVENTS, createEventId } from './event-utils';
import {
  Box,
  Flex,
  Heading,
  List,
  ListItem,
  Text,
  Switch,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';

const DemoApp: React.FC = () => {
  const [weekendsVisible, setWeekendsVisible] = useState(true);
  const [currentEvents, setCurrentEvents] = useState<EventApi[]>([]);

  const handleWeekendsToggle = () => {
    setWeekendsVisible(!weekendsVisible);
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    let title = prompt('Please enter a new title for your event');
    let calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

    if (title) {
      calendarApi.addEvent({
        id: createEventId(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
      });
    }
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    if (
      confirm(
        `Are you sure you want to delete the event '${clickInfo.event.title}'`
      )
    ) {
      clickInfo.event.remove();
    }
  };

  const handleEvents = (events: EventApi[]) => {
    setCurrentEvents(events);
  };

  return (
    <Flex flexDirection="column" align="center" p={5}>
      <Sidebar
        weekendsVisible={weekendsVisible}
        currentEvents={currentEvents}
        onToggleWeekends={handleWeekendsToggle}
      />
      <Box w="100%" p={5} borderWidth={1} borderRadius="md" boxShadow="lg">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          initialView="dayGridMonth"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={weekendsVisible}
          initialEvents={INITIAL_EVENTS}
          select={handleDateSelect}
          eventContent={renderEventContent}
          eventClick={handleEventClick}
          eventsSet={handleEvents}
        />
      </Box>
    </Flex>
  );
};

interface SidebarProps {
  weekendsVisible: boolean;
  currentEvents: EventApi[];
  onToggleWeekends: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  weekendsVisible,
  currentEvents,
  onToggleWeekends,
}) => {
  const bgColor = useColorModeValue('gray.100', 'gray.800');

  return (
    <VStack
      spacing={4}
      w="full"
      maxW="300px"
      p={4}
      mb={4}
      borderWidth={1}
      borderRadius="md"
      boxShadow="lg"
      bg={bgColor}
      alignItems="flex-start"
    >
      <Box w="full">
        <Heading size="md" mb={2}>
          Instructions
        </Heading>
        <List spacing={1}>
          <ListItem>
            Select dates and you will be prompted to create a new event
          </ListItem>
          <ListItem>Drag, drop, and resize events</ListItem>
          <ListItem>Click an event to delete it</ListItem>
        </List>
      </Box>
      <Box w="full">
        <Flex alignItems="center" justifyContent="space-between">
          <Text>Toggle Weekends</Text>
          <Switch
            isChecked={weekendsVisible}
            onChange={onToggleWeekends}
            size="lg"
          />
        </Flex>
      </Box>
      <Box w="full">
        <Heading size="md" mb={2}>
          All Events ({currentEvents.length})
        </Heading>
        <List spacing={1}>{currentEvents.map(renderSidebarEvent)}</List>
      </Box>
    </VStack>
  );
};

function renderEventContent(eventContent: EventContentArg) {
  return (
    <Box>
      <Text as="b">{eventContent.timeText}</Text>
      <Text as="i">{eventContent.event.title}</Text>
    </Box>
  );
}

function renderSidebarEvent(event: EventApi) {
  return (
    <ListItem key={event.id}>
      <Text>
        <Text as="b">
          {formatDate(event.start!, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </Text>{' '}
        <Text as="i">{event.title}</Text>
      </Text>
    </ListItem>
  );
}

export default DemoApp;
