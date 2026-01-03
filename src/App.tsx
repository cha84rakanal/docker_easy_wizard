import { useState } from "react";
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CommandList from "./components/CommandList";
import WizardDialog from "./components/WizardDialog";
import { useCommandStore } from "./store/commandStore";

export default function App() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const { entries, addEntry } = useCommandStore();

  const handleOpenWizard = () => {
    setWizardOpen(true);
  };

  const handleCloseWizard = () => {
    setWizardOpen(false);
  };

  return (
    <Box className="app-shell">
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          backgroundColor: "rgba(231, 245, 252, 0.9)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(27, 127, 167, 0.12)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h6">Docker Run Wizard</Typography>
            <Typography variant="body2" color="text.secondary">
              docker run コマンドをステップで構築
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={handleOpenWizard}
          >
            新規作成
          </Button>
        </Toolbar>
      </AppBar>

      <CommandList entries={entries} onCreateClick={handleOpenWizard} />

      <WizardDialog open={wizardOpen} onClose={handleCloseWizard} onSave={addEntry} />
    </Box>
  );
}
