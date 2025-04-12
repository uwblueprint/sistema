export const components = {
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
};
