import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { alpha } from '@mui/material/styles';

// Palette de couleurs du projet
const colors = {
  lighter: '#FFF2F2',
  light: '#A9B5DF',
  medium: '#7886C7',
  dark: '#2D336B'
};

// Créer un thème personnalisé avec notre palette
const theme = createTheme({
  palette: {
    primary: {
      main: colors.dark,
      light: colors.medium,
      dark: colors.dark,
      contrastText: colors.lighter,
    },
    secondary: {
      main: colors.medium,
      light: colors.light,
      dark: colors.dark,
      contrastText: colors.lighter,
    },
    error: {
      main: colors.dark,
      light: colors.medium,
      contrastText: colors.lighter,
    },
    warning: {
      main: colors.medium,
      light: colors.light,
      contrastText: colors.lighter,
    },
    info: {
      main: colors.medium,
      light: colors.light,
      contrastText: colors.lighter,
    },
    success: {
      main: colors.dark,
      light: colors.medium,
      contrastText: colors.lighter,
    },
    background: {
      default: colors.lighter,
      paper: colors.lighter,
    },
    text: {
      primary: colors.dark,
      secondary: colors.medium,
      disabled: colors.light,
    },
    divider: colors.light,
    action: {
      active: colors.medium,
      hover: colors.light,
      selected: colors.medium,
      disabled: colors.light,
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: { color: colors.dark },
    h2: { color: colors.dark },
    h3: { color: colors.dark },
    h4: { color: colors.dark },
    h5: { color: colors.dark },
    h6: { color: colors.dark },
    subtitle1: { color: colors.dark },
    subtitle2: { color: colors.medium },
    body1: { color: colors.dark },
    body2: { color: colors.medium },
    button: { color: colors.dark },
    caption: { color: colors.medium },
    overline: { color: colors.medium },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
        contained: {
          backgroundColor: colors.dark,
          color: colors.lighter,
          '&:hover': {
            backgroundColor: colors.medium,
          },
        },
        outlined: {
          borderColor: colors.medium,
          color: colors.dark,
        },
        text: {
          color: colors.dark,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: colors.lighter,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.dark,
          color: colors.lighter,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: colors.light,
          color: colors.dark,
        },
        colorPrimary: {
          backgroundColor: colors.dark,
          color: colors.lighter,
        },
        colorSecondary: {
          backgroundColor: colors.medium,
          color: colors.lighter,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: colors.light,
            },
            '&:hover fieldset': {
              borderColor: colors.medium,
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.dark,
            },
          },
          '& .MuiInputLabel-root': {
            color: colors.medium,
          },
          '& .MuiInputBase-input': {
            color: colors.dark,
          },
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: colors.medium,
        },
        colorPrimary: {
          color: colors.dark,
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          backgroundColor: colors.lighter,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.medium,
          color: colors.lighter,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: colors.light,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: colors.dark,
          '&:hover': {
            color: colors.medium,
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardSuccess: {
          backgroundColor: alpha(colors.dark, 0.1),
          color: colors.dark
        },
        standardError: {
          backgroundColor: alpha(colors.dark, 0.1),
          color: colors.dark
        },
        standardWarning: {
          backgroundColor: alpha(colors.medium, 0.1),
          color: colors.dark
        },
        standardInfo: {
          backgroundColor: alpha(colors.medium, 0.1), 
          color: colors.dark
        }
      }
    }
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
); 