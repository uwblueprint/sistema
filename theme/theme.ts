// src/theme/theme.ts
import { extendTheme } from '@chakra-ui/react';
import { colors } from './colors';
import { components } from './components';
import { fonts } from './fonts';
import { textStyles } from './textStyles';

const theme = extendTheme({
  fonts,
  colors,
  textStyles,
  components,
});

export default theme;
export type CustomTheme = typeof theme;
