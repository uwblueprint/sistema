import { css } from '@emotion/react';
import { CustomTheme } from '../theme/theme';

export const getCalendarStyles = (theme: CustomTheme) => css`
  .fc-weekend {
    background-color: rgba(0, 0, 0, 0.05) !important;
  }
  .fc-event {
    border: 0px;
    background-color: transparent;
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
