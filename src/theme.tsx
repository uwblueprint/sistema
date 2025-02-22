import { extendTheme } from '@chakra-ui/react';
import '@fontsource/inter';
import '@fontsource/poppins';

const fonts = {
  heading: `'Poppins', sans-serif`,
  body: `'Inter', sans-serif`,
  mono: `'Inter', monospace`,
};

const breakpoints = {
  sm: '40em',
  md: '52em',
  lg: '64em',
  xl: '80em',
};

const theme = extendTheme({
  fonts,
  breakpoints,
  colors: {
    buttonBackground: '#FDFDFD',
    primaryBlue: {
      600: '#24385E',
      500: '#244990',
      400: '#2248AF',
      300: '#0468C1',
      200: '#248DFE',
      100: '#63BAFF',
      50: '#E4F3FF',
    },
    neutralGray: {
      900: '#141414',
      800: '#343434',
      700: '#525252',
      600: '#656565',
      500: '#8C8C8C',
      400: '#ADADAD',
      300: '#D2D2D2',
      200: '#E3E3E3',
      100: '#EFEFEF',
      50: '#F7F7F7',
    },
    eventColors: {
      orange: {
        100: '#FEEED5',
        200: '#FBD38D',
        300: '#F7A75C',
        400: '#7E3E02',
      },
      coral: {
        100: '#8B2321',
        200: '#F06E6B',
        300: '#FFBFBD',
        400: '#FFEBEB',
      },
      purple: {
        100: '#5F2D66',
        200: '#9F65A8',
        300: '#D2AED8',
        400: '#EED5F2',
      },
      turquoise: {
        100: '#D5F6F3',
        200: '#81E6D9',
        300: '#25BAAB',
        400: '#0D5A53',
      },
      orchid: {
        100: '#D8CCED',
        200: '#AEA2C3',
        300: '#615574',
        400: '#3D324F',
      },
      blue: {
        100: '#D9E4FF',
        200: '#A7C1FF',
        300: '#6592FF',
        400: '#263C71',
      },
      green: {
        100: '#DDFBDD',
        200: '#C0E3A4',
        300: '#79A854',
        400: '#2D4F12',
      },
      yellow: {
        100: '#FDF8E1',
        200: '#FCEFB4',
        300: '#F9DC5C',
        400: '#615219',
      },
    },
    positiveGreen: {
      100: '#D8F5C1',
      200: '#5A8934',
      300: '#2D4F12',
    },
    warningOrange: {
      100: '#FEEED5',
      200: '#E2941F',
      300: '#9B520E',
    },
    errorRed: {
      100: '#FFE4E4',
      200: '#BF3232',
      300: '#900A0A',
    },
  },
  styles: {
    global: {
      'html, body': {
        backgroundColor: 'white',
        color: 'neutralGray.900',
      },
      h1: {
        color: 'neutralGray.900',
      },
      h2: {
        color: 'neutralGray.800',
      },
      p: {
        color: 'neutralGray.700',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        bg: 'buttonBackground',
        color: 'primaryBlue.300',
        borderRadius: '7px',
        _active: {
          bg: 'primaryBlue.400',
        },
        _disabled: {
          bg: 'neutralGray.200',
          color: 'neutralGray.400',
        },
      },
      variants: {
        solid: {
          bg: 'primaryBlue.300',
          color: 'white',
          _hover: {
            bg: 'primaryBlue.500',
          },
        },
        outline: {
          borderColor: 'neutralGray.300',
          color: 'black',
          _hover: {
            bg: 'primaryBlue.50',
          },
        },
      },
    },
    Heading: {
      baseStyle: {
        color: 'black',
      },
      sizes: {
        h1: {
          fontWeight: 500,
          fontSize: '28px',
          lineHeight: '42px',
        },
        h2: {
          fontWeight: 500,
          fontSize: '22px',
          lineHeight: '33px',
        },
        h3: {
          fontWeight: 600,
          fontSize: '16px',
          lineHeight: '24px',
        },
        h4: {
          fontWeight: 500,
          fontSize: '14px',
          lineHeight: '21px',
        },
      },
    },
    Text: {
      baseStyle: {
        color: 'black',
      },
      variants: {
        semibold: {
          fontWeight: 600,
          fontSize: '13px',
          lineHeight: '15.73px',
        },
        subtitle: {
          fontWeight: 400,
          fontSize: '13px',
          lineHeight: '15.73px',
        },
        caption: {
          fontWeight: 400,
          fontSize: '12px',
          lineHeight: '14.52px',
        },
        body: {
          fontWeight: 400,
          fontSize: '11px',
          lineHeight: '13.31px',
        },
        label: {
          fontWeight: 500,
          fontSize: '12px',
          lineHeight: '18px',
        },
        cellBody: {
          fontWeight: 400,
          fontSize: '15px',
          lineHeight: '18.15px',
        },
        cellBold: {
          fontWeight: 600,
          fontSize: '15px',
          lineHeight: '18.15px',
        },
      },
    },
  },
});

export default theme;
