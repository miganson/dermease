import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#a75438"
    },
    secondary: {
      main: "#5f7f64"
    },
    background: {
      default: "#fffaf6",
      paper: "#fffdf9"
    },
    text: {
      primary: "#2d221d",
      secondary: "#6a5750"
    }
  },
  typography: {
    fontFamily: '"Manrope", "Segoe UI", sans-serif',
    h1: {
      fontFamily: '"Fraunces", Georgia, serif',
      fontWeight: 700
    },
    h2: {
      fontFamily: '"Fraunces", Georgia, serif',
      fontWeight: 700
    },
    h3: {
      fontFamily: '"Fraunces", Georgia, serif',
      fontWeight: 700
    },
    h4: {
      fontFamily: '"Fraunces", Georgia, serif',
      fontWeight: 700
    }
  },
  shape: {
    borderRadius: 18
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: "1px solid rgba(167, 84, 56, 0.08)",
          boxShadow: "0 18px 50px rgba(103, 68, 55, 0.08)"
        }
      }
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          textTransform: "none",
          fontWeight: 700
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24
        }
      }
    }
  }
});
