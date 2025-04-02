import { css } from '@emotion/react';
import { CustomTheme } from '../theme/theme';

export const getCalendarStyles = (theme: CustomTheme) => css`
  .fc-event {
    border: 0px;
    background-color: transparent;
  }
  .fc th {
    text-transform: uppercase;
    font-size: ${theme.fontSizes.sm};
    font-weight: ${theme.fontWeights[600]};
  }
  .fc-day-today {
    background-color: inherit !important;
  }
  .fc-weekend {
    background-color: rgba(0, 0, 0, 0.05) !important;
  }
  .fc-event-title {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: ${theme.fontSizes.sm};
    font-weight: ${theme.fontWeights[400]};
  }
  .fc .fc-daygrid-day-number {
    width: 100%;
  }
  .fc .fc-scrollgrid thead .fc-col-header-cell {
    border-left: none !important;
    border-right: none !important;
    border-top: none !important;
  }
  .fc .fc-col-header-cell {
    height: 32px;
  }
  .fc .fc-col-header-cell .fc-scrollgrid-sync-inner {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 500;
  }
`;
