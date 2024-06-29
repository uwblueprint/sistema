import { Flex, Heading } from '@chakra-ui/react';

interface HeroProps {
  title?: string;
}

export const Hero = ({ title = 'Sistema' }: HeroProps) => (
  <Flex
    justifyContent="center"
    alignItems="center"
    height="100vh"
    bgGradient="linear(to-l, heroGradientStart, heroGradientEnd)"
    bgClip="text"
  >
    <Heading fontSize="6vw">{title}</Heading>
  </Flex>
);
