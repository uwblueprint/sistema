import { Global } from '@emotion/react';

export const CalendarStyles = () => (
  <Global
    styles={`
      .react-calendar {
        width: 100%;
        max-width: 100%;
        background: white;
        border: none;
        font-family: Arial, Helvetica, sans-serif;
        line-height: 1.125em;
      }
      .react-calendar__tile {
        max-width: 100%;
        padding: 0;
        background: none;
        text-align: center;
        line-height: 16px;
        font-size: 0.9em;
        height: 120px;
        position: relative;
      }
      .react-calendar__month-view__days__day {
        color: #1a202c;
      }
      .react-calendar__navigation button {
        min-width: 44px;
        background: none;
        font-size: 1.2em;
        margin-top: 8px;
      }
      .react-calendar__month-view__weekdays__weekday {
        padding: 0.75em;
        font-size: 1em;
        font-weight: bold;
        text-decoration: none;
        color: #4a5568;
      }
      .react-calendar__tile > abbr {
        position: absolute;
        top: 4px;
        left: 4px;
        z-index: 1;
      }
    `}
  />
);
