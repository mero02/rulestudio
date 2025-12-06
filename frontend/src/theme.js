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
    // Colores temáticos para estados
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e', // Verde para correcto
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444', // Rojo para incorrecto
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // Amarillo para advertencias
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    gold: {
      50: '#fefce8',
      100: '#fef9c3',
      200: '#fef08a',
      300: '#fde047',
      400: '#facc15',
      500: '#eab308', // Dorado para victorias
      600: '#ca8a04',
      700: '#a16207',
      800: '#854d0e',
      900: '#713f12',
    },
    wheel: {
      primary: '#ff8f43',
      secondary: '#70bbe0',
      accent: '#0b3351',
      highlight: '#f9dd50',
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
      baseStyle: {
        borderRadius: 'lg',
        fontWeight: 'semibold',
        transition: 'all 0.2s',
        _hover: {
          transform: 'translateY(-1px)',
          boxShadow: 'lg',
        },
        _active: {
          transform: 'translateY(0)',
        },
      },
      variants: {
        gradient: {
          bgGradient: 'linear(to-r, brand.400, brand.600)',
          color: 'white',
          _hover: {
            bgGradient: 'linear(to-r, brand.500, brand.700)',
            transform: 'translateY(-2px)',
            boxShadow: 'xl',
          },
        },
        success: {
          bgGradient: 'linear(to-r, success.400, success.600)',
          color: 'white',
          _hover: {
            bgGradient: 'linear(to-r, success.500, success.700)',
          },
        },
        error: {
          bgGradient: 'linear(to-r, error.400, error.600)',
          color: 'white',
          _hover: {
            bgGradient: 'linear(to-r, error.500, error.700)',
          },
        },
      },
    },
    Box: {
      baseStyle: (props) => ({
        bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
        borderRadius: 'lg',
        boxShadow: 'sm',
        transition: 'all 0.2s',
      }),
    },
  },
});

export default theme;