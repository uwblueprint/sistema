import { useState } from 'react';
import { Button, Container, Input, Text, Textarea } from '@chakra-ui/react';

const Email = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [emailText, setEmailText] = useState('');
  const [subject, setSubject] = useState('');
  const [emailRecipients, setEmailRecipients] = useState([]);

  const handleEmailSend = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailRecipients,
          subject: subject,
          text: emailText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Detailed error response:', errorData); // Log the error details for debugging
        throw new Error(
          `Failed to send email. Status: ${response.status}. ${errorData.details || 'Unknown error'}`
        );
      }

      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error('Error caught:', error); // Log the full error object for debugging
      setMessage(`Error sending email: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailTextChange = (e) => {
    setEmailText(e.target.value);
  };

  const handleSubjectChange = (e) => {
    setSubject(e.target.value);
  };

  const handleEmailRecipientsChange = (e) => {
    const recipientsString = e.target.value;
    setEmailRecipients(recipientsString.split(','));
  };

  return (
    <Container>
      <Input
        placeholder="Add recipients here"
        onChange={handleEmailRecipientsChange}
      />
      <Input placeholder="Add subject here" onChange={handleSubjectChange} />
      <Textarea
        placeholder="Write your email here"
        value={emailText}
        onChange={handleEmailTextChange}
      />
      <Button
        onClick={handleEmailSend}
        isLoading={isLoading}
        loadingText="Sending"
        colorScheme="blue"
      >
        Send Email
      </Button>
      {message && (
        <Text
          mt={4}
          color={message.startsWith('Error') ? 'red.500' : 'green.500'}
        >
          {message}
        </Text>
      )}
    </Container>
  );
};

export default Email;
