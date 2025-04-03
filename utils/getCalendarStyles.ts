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
`;
