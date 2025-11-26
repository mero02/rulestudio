import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: '#e6f3ff',
      100: '#b3d9ff',
      200: '#80bfff',
      300: '#4da6ff',
      400: '#1a8cff',
      500: '#0072e6', // Color primario
      600: '#005bb8',
      700: '#00448a',
      800: '#002d5c',
      900: '#00162e',
    },
  },
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`,
    mono: `'JetBrains Mono', 'Fira Code', monospace`,
  },
  textStyles: {
    h1: {
      fontSize: ['2xl', '3xl', '4xl'],
      fontWeight: 'bold',
      lineHeight: 'short',
      letterSpacing: 'tight',
    },
    h2: {
      fontSize: ['xl', '2xl', '3xl'],
      fontWeight: 'semibold',
      lineHeight: 'shorter',
      letterSpacing: 'tight',
    },
    body: {
      fontSize: ['sm', 'md', 'lg'],
      lineHeight: 'tall',
    },
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      },
    }),
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
    Box: {
      baseStyle: (props) => ({
        bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
      }),
    },
  },
});

export default theme;