import { extendTheme } from '@chakra-ui/react';
import '@fontsource/inter';
import '@fontsource/poppins';

const fonts = {
  heading: `'Poppins', sans-serif`,
  body: `'Inter', sans-serif`,
};

const colors = {
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
  text: {
    header: '#1B1B1B',
    body: '#373636',
    subtitle: '#838383',
    inactiveButtonText: '#ACACAC',
  },
  outline: '#C5C8D8',
  icon: '#1E1E1E',
};

const textStyles = {
  h1: {
    fontWeight: 600,
    fontSize: '28px',
    lineHeight: '42px',
    color: 'text.header',
    fontFamily: 'heading',
  },
  h2: {
    fontWeight: 600,
    fontSize: '22px',
    lineHeight: '33px',
    color: 'text.header',
    fontFamily: 'heading',
  },
  h3: {
    fontWeight: 700,
    fontSize: '16px',
    lineHeight: '24px',
    color: 'text.header',
    fontFamily: 'heading',
  },
  h4: {
    fontWeight: 600,
    fontSize: '14px',
    lineHeight: '21px',
    color: 'text.header',
    fontFamily: 'heading',
  },
  subtitle: {
    fontWeight: 400,
    fontSize: '13px',
    lineHeight: '15.73px',
    color: 'text.subtitle',
    fontFamily: 'body',
  },
  caption: {
    fontWeight: 400,
    fontSize: '12px',
    lineHeight: '14.52px',
    color: 'text.body',
    fontFamily: 'body',
  },
  body: {
    fontWeight: 400,
    fontSize: '11px',
    lineHeight: '13.31px',
    color: 'text.body',
    fontFamily: 'body',
  },
  label: {
    fontWeight: 500,
    fontSize: '12px',
    lineHeight: '18px',
    color: 'text.header',
    fontFamily: 'heading',
  },
  button: {
    fontWeight: 600,
    fontSize: '16px',
    lineHeight: '24px',
    fontFamily: 'heading',
  },
  cellBody: {
    fontWeight: 400,
    fontSize: '15px',
    lineHeight: '18.15px',
    color: 'text.body',
    fontFamily: 'body',
  },
  cellBold: {
    fontWeight: 600,
    fontSize: '15px',
    lineHeight: '18.15px',
    color: 'text.header',
    fontFamily: 'heading',
  },
};

const theme = extendTheme({
  fonts,
  colors,
  textStyles,
  components: {
    Button: {
      baseStyle: {
        fontFamily: 'heading',
        fontSize: '16px',
        lineHeight: '24px',
        fontWeight: 600,
        bg: 'buttonBackground',
        color: 'primaryBlue.300',
        borderRadius: '7px',
        _hover: {
          bg: 'primaryBlue.500',
        },
        _active: {
          bg: 'primaryBlue.600',
        },
        _disabled: {
          bg: 'neutralGray.100',
          color: 'text.inactiveButtonText',
        },
      },
      variants: {
        solid: {
          bg: 'primaryBlue.300',
          color: 'white',
          _hover: {
            bg: 'primaryBlue.500',
          },
          _active: {
            bg: 'primaryBlue.600',
          },
          _disabled: {
            bg: 'neutralGray.100',
            color: 'text.inactiveButtonText',
          },
        },
        outline: {
          borderColor: 'neutralGray.300',
          border: '1px solid',
          color: 'text.header',
          _hover: {
            bg: 'neutralGray.100',
          },
          _active: {
            bg: 'neutralGray.300',
          },
          _disabled: {
            bg: 'neutralGray.100',
            color: 'text.inactiveButtonText',
          },
        },
        ghost: {
          bg: 'transparent',
          _hover: {
            bg: 'neutralGray.100',
          },
          _active: {
            bg: 'neutralGray.300',
          },
          _disabled: {
            bg: 'neutralGray.100',
            color: 'text.inactiveButtonText',
          },
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          border: '1px solid',
          borderColor: 'outline',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: 400,
          lineHeight: '15.73px',
          fontFamily: 'body',
          _placeholder: {
            color: 'text.subtitle',
          },
          _hover: {
            borderColor: 'outline',
          },
          _focus: {
            borderColor: 'primaryBlue.300',
            boxShadow: '0 0 0 1px primaryBlue.300',
          },
          _active: {
            borderColor: 'primaryBlue.300',
            boxShadow: '0 0 0 1px primaryBlue.300',
          },
        },
      },
      sizes: {},
      variants: {},
      defaultProps: {
        variant: null,
      },
    },
    Textarea: {
      baseStyle: {
        border: '1px solid',
        borderColor: 'outline',
        borderRadius: '10px',
        fontSize: '13px',
        fontWeight: 400,
        lineHeight: '15.73px',
        fontFamily: 'body',
        _placeholder: {
          color: 'text.subtitle',
        },
        _hover: {
          borderColor: 'outline',
        },
        _focus: {
          borderColor: 'primaryBlue.300',
          boxShadow: '0 0 0 1px primaryBlue.300',
        },
        _active: {
          borderColor: 'primaryBlue.300',
          boxShadow: '0 0 0 1px primaryBlue.300',
        },
      },
      sizes: {},
      variants: {},
      defaultProps: {
        variant: null,
      },
    },
    Tooltip: {
      baseStyle: {
        bg: 'white',
        color: 'text.body',
        borderRadius: 'md',
        px: 3,
        py: 2,
        fontSize: 'sm',
        maxWidth: '320px',
        '--popper-arrow-bg': 'white',
        boxShadow: 'md',
        border: '1px solid',
        borderColor: 'neutralGray.200',
      },
    },
  },
});

export default theme;
