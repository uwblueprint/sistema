import { Link as ChakraLink, Button } from "@chakra-ui/react";

import { Container } from "./Container";

export const CTA = () => (
  <Container
    flexDirection="row"
    position="fixed"
    bottom={0}
    width="full"
    maxWidth="3xl"
    py={3}
  >
    <Button
      as={ChakraLink}
      isExternal
      href="https://www.notion.so/uwblueprintexecs/Sistema-03b6ce1c4bc447b5945ab8b79cb00ea5"
      variant="outline"
      colorScheme="green"
      rounded="button"
      flexGrow={1}
      mx={2}
      width="full"
    >
      View Notion
    </Button>
    <Button
      as={ChakraLink}
      isExternal
      href="https://github.com/uwblueprint/sistema"
      variant="solid"
      colorScheme="green"
      rounded="button"
      flexGrow={3}
      mx={2}
      width="full"
    >
      View Repo
    </Button>
  </Container>
);
