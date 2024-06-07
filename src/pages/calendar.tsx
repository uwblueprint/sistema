import { Calendar as ReactCalendar } from 'react-calendar'
import 'react-calendar/dist/Calendar.css';

import { Container, Text } from "@chakra-ui/react";

import { useState } from 'react';

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

const Calendar = () => {
    const [value, onChange] = useState<Value>(new Date());
    const [clickedDate, setClickedDate] = useState<ValuePiece>(null);
    
    const onClickDay = (value: ValuePiece) => {
        setClickedDate(value);
    };

    return (
        <Container>
            <ReactCalendar 
                onChange={onChange} 
                value={value} 
                onClickDay={onClickDay}
            />
            <Text>Clicked date: {clickedDate?.toDateString()}</Text>
        </Container>
    );
};

export default Calendar;
