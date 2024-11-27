import { useSession } from 'next-auth/react';
import { ReactElement, useEffect, useState } from 'react';

/**
 * Note to self:
 * use Chakra VERSION 2 for Popover.
 */

// import { SignOutButton } from '../components/SignOutButton';
// import { Image } from '@chakra-ui/react';

import {
  Avatar,
  // AvatarBadge,
  // AvatarGroup,
  // Input,
  // Button,
  // Box,
  HStack,
  Heading,
  Flex,
  Text,
} from '@chakra-ui/react';

import { ButtonShort } from '../components/Button';

interface UserData {
  numOfAbsences: number;
  absences: Array<any>;
}

// const LogOutButton = () => {};

export default function Profile() {
  const { data: session } = useSession(); // also contains status
  const [numAbsences, setNumAbsences] = useState<number>(0);
  const [usedAbsences, setUsedAbsences] = useState<number>(0);
  const [formattedAbsenceText, setFormattedAbsenceText] =
    useState<ReactElement>(<Text>...</Text>);

  useEffect(() => {
    const percentageTaken = (usedAbsences / numAbsences) * 100;

    setFormattedAbsenceText(
      <HStack>
        <Text
          color={
            percentageTaken < 60
              ? '#5A8934'
              : percentageTaken < 80
                ? '#E2941F'
                : '#BF3232'
          }
        >
          {usedAbsences}/{numAbsences}
        </Text>
        <Text> Absences Taken</Text>
      </HStack>
    );
  }, [numAbsences, usedAbsences]);

  useEffect(() => {
    const fetchUserDataByEmail = async () => {
      if (!session || !session.user || !session.user.email) return;

      const email = session.user.email;
      const apiUrl = `/api/users/email/${email}?shouldIncludeAbsences=true`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        const data: UserData = await response.json();
        setNumAbsences(data.numOfAbsences);
        setUsedAbsences(data.absences.length);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchUserDataByEmail();
  }, [session]);

  /*
  
  display: flex;
width: 16.125rem;
padding: 1.8125rem 1.4375rem 1.80163rem 1.4375rem;
flex-direction: column;
justify-content: center;
align-items: center done 
  
*/

  return (
    // padding: ;

    <Flex
      width="16.125rem"
      padding="1.8125rem 1.4375rem 1.8rem 1.4375rem"
      borderWidth="1px"
      borderRadius="0.5rem"
      maxW="sm"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      {session && session.user && session.user.image ? (
        <>
          <Flex flexDirection="column" alignItems="center" gap="1.25rem">
            <Heading fontSize="1.375rem">Hi, {session.user.name}!</Heading>
            <Text color="#838383" fontStyle="normal" fontSize="0.875rem">
              {session.user.email}
            </Text>
            <Avatar size="2xl" name="Dan Abrahmov" src={session.user.image} />
            {formattedAbsenceText}
            <ButtonShort>Log Out</ButtonShort>
          </Flex>
        </>
      ) : (
        <div>user UNdefined</div>
      )}
    </Flex>
  );
}
