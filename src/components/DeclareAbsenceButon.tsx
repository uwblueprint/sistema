import React from 'react';
import { Button } from '@chakra-ui/react';

interface DeclareAbsenceButtonProps {
  onClick: () => void;
}

const DeclareAbsenceButton: React.FC<DeclareAbsenceButtonProps> = ({
  onClick,
}) => {
  return (
    <Button
      onClick={onClick}
      style={{
        position: 'fixed',
        top: '75px',
        left: '10px',
        zIndex: 1000,
      }}
    >
      Declare Absence
    </Button>
  );
};

export default DeclareAbsenceButton;
