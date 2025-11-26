import { Button, useColorMode, useColorModeValue } from '@chakra-ui/react';

const ThemeToggle = () => {
  const { toggleColorMode } = useColorMode();
  const text = useColorModeValue('🌙', '☀️');

  return (
    <Button
      onClick={toggleColorMode}
      variant="ghost"
      size="lg"
      position="fixed"
      top={4}
      right={4}
      zIndex={1000}
    >
      {text}
    </Button>
  );
};

export default ThemeToggle;