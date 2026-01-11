import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2496ed",
    },
    secondary: {
      main: "#12b5cb",
    },
    background: {
      default: "#f4f6f8",
      paper: "#ffffff",
    },
    info: {
      main: "#1e88e5",
    },
  },
  typography: {
    fontFamily: '"Space Grotesk", "Segoe UI", sans-serif',
    h4: {
      fontWeight: 600,
      letterSpacing: "-0.02em",
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 10,
  },
});
