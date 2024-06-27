/* eslint-disable prettier/prettier */
import {
  Link as ChakraLink,
  Text,
  Code,
  List,
  ListIcon,
  ListItem,
} from '@chakra-ui/react';
import { CheckCircleIcon, LinkIcon } from '@chakra-ui/icons';

import { Hero } from '../components/Hero';
import { Container } from '../components/Container';
import { Main } from '../components/Main';
import { DarkModeSwitch } from '../components/DarkModeSwitch';
import { CTA } from '../components/CTA';
import { Footer } from '../components/Footer';

const Index = () => (
  <Container height="100vh">
    <Hero />
    <Main>
      <Text color="text">
        Sistema Toronto is a non-profit organization dedicated to providing
        accessible and high-quality music education to youth from underserved
        communities. We are building a class management platform where teachers
        can mark their absences, upload lesson plans, claim classes from other
        absent teachers, and receive class related email notifications. Our
        Stack is <Code>Next.js</Code> + <Code>chakra-ui</Code> +
        <Code>TypeScript</Code>.
      </Text>

      <List spacing={3} my={0} color="text">
        <ListItem>
          <ListIcon as={CheckCircleIcon} color="green.500" />
          <ChakraLink
            isExternal
            href="https://www.sistema-toronto.ca/"
            flexGrow={1}
            mr={2}
          >
            Sistema Toronto Website <LinkIcon />
          </ChakraLink>
        </ListItem>
        <ListItem>
          <ListIcon as={CheckCircleIcon} color="green.500" />
          <ChakraLink
            isExternal
            href="https://uwblueprint.org/"
            flexGrow={1}
            mr={2}
          >
            UW Blueprint Website Github <LinkIcon />
          </ChakraLink>
        </ListItem>
      </List>
    </Main>

    <DarkModeSwitch />
    <Footer>
      <Text>© UW Blueprint 2024</Text>
    </Footer>
    <CTA />
  </Container>
);

export default Index;
