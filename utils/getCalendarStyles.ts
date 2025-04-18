import { css } from '@emotion/react';
import { CustomTheme } from '../theme/theme';

export const getCalendarStyles = (theme: CustomTheme) => css`
  .fc-event {
    border: 0px;
    background-color: transparent;
    margin: 0 !important;
  }
  .fc-day-today {
    background-color: inherit !important;
  }
  .fc-weekend {
    background-color: rgba(0, 0, 0, 0.05) !important;
  }
  .fc .fc-daygrid-day {
    padding: 8px 5px !important;
  }
  .fc .fc-daygrid-day-top {
    padding: 0 !important;
    height: 30px;
  }
  .fc .fc-daygrid-day-number {
    width: 100%;
    padding: 0 !important;
  }
  .fc-daygrid-day-events {
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  .fc-daygrid-day-events:not(:empty) {
    margin-bottom: 30px !important;
  }
  .fc-daygrid-event-harness {
    margin-top: 4px !important;
  }
  .fc-daygrid-event-harness:first-of-type {
    margin-top: 0 !important;
  }
  .fc-scroller {
    overflow: auto !important;
    max-height: 100% !important;
  }
  .fc-view-harness {
    height: auto !important;
    overflow: visible !important;
  }
  .fc .fc-scrollgrid {
    border: none !important;
  }
  .fc .fc-scrollgrid thead .fc-col-header-cell {
    border-left: none !important;
    border-right: none !important;
  }
  .fc .fc-col-header-cell {
    height: 32px;
  }
  .fc .fc-col-header-cell .fc-scrollgrid-sync-inner {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: ${theme.fontWeights[600]};
    text-transform: uppercase;
    font-size: 14px;
  }
`;
