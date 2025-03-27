import { css } from '@emotion/react';
import { CustomTheme } from '../src/theme';

export const getCalendarStyles = (theme: CustomTheme) => css`
  .fc .fc-daygrid-day-top {
    flex-direction: row;
  }
  .fc th {
    text-transform: uppercase;
    font-size: ${theme.fontSizes.sm};
    font-weight: ${theme.fontWeights[600]};
  }
  .fc-day-today {
    background-color: inherit !important;
  }
  .fc-daygrid-day-number {
    margin-left: 6px;
    margin-top: 6px;
    font-size: ${theme.fontSizes.xs};
    font-weight: ${theme.fontWeights[400]};
    width: 25px;
    height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .fc-day-today .fc-daygrid-day-number {
    background-color: ${theme.colors.primaryBlue[300]};
    color: white;
    border-radius: 50%;
    width: 25px;
    height: 25px;
    display: flexx;
    align-items: center;
    justify-content: center;
  }
  .fc-weekend {
    background-color: rgba(0, 0, 0, 0.05) !important;
  }
  .fc-event {
    padding: ${theme.space[2]} ${theme.space[3]};
    margin: ${theme.space[2]} 0;
    border-radius: ${theme.radii.md};
  }
  .fc-event-title {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: ${theme.fontSizes.sm};
    font-weight: ${theme.fontWeights[400]};
  }
  .fc-selected-date .fc-daygrid-day-number {
    background-color: ${theme.colors.primaryBlue[50]};
    color: ${theme.colors.primaryBlue[300]};
    border-radius: 50%;
    width: 25px;
    height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;
