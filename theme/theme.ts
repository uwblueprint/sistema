// src/theme/theme.ts
import { extendTheme } from '@chakra-ui/react';
import { fonts } from './fonts';
import { colors } from './colors';
import { textStyles } from './textStyles';
import { components } from './components';

const theme = extendTheme({
  fonts,
  colors,
  textStyles,
  components,
});

export default theme;
export type CustomTheme = typeof theme;
