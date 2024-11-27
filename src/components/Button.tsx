import { Button } from '@chakra-ui/react';
/**
 * Need to implement the button with the following properties:
display: flex;
width: 6.25rem;
padding: 0.50544rem 0.53069rem;
justify-content: space-between;
align-items: center;

border-radius: 0.3125rem;
border: 1.213px solid var(--Button-Primary-Blue, #0468C1);
background: var(--Button-Background, #FDFDFD);

 */

import { defineStyle, defineStyleConfig } from '@chakra-ui/react';

// https://v2.chakra-ui.com/docs/components/button/theming#adding-a-custom-variant
const brandPrimary = defineStyle({
  background: '#000000',
  color: 'white',
  fontFamily: 'serif',
  fontWeight: 'normal',
});

export const buttonTheme = defineStyleConfig({
  variants: { brandPrimary },
});

export function ButtonShort({ children }) {
  return <Button variant="brandPrimary">{children}</Button>;
}
