import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#3aa9d6",
    },
    secondary: {
      main: "#6fd3f5",
    },
    background: {
      default: "#eef7fb",
      paper: "#ffffff",
    },
    info: {
      main: "#2b95bf",
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
