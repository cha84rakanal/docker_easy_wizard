import { useState } from "react";
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CommandList from "./components/CommandList";
import WizardDialog from "./components/WizardDialog";
import type { CommandEntry, WizardForm } from "./models/command";
import { useCommandStore } from "./store/commandStore";

export default function App() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const { entries, addEntry, updateEntry } = useCommandStore();

  const handleOpenWizard = () => {
    setEditingEntryId(null);
    setWizardOpen(true);
  };

  const handleCloseWizard = () => {
    setWizardOpen(false);
    setEditingEntryId(null);
  };

  const handleEditEntry = (entry: CommandEntry) => {
    setEditingEntryId(entry.id);
    setWizardOpen(true);
  };

  const handleSaveWizard = (form: WizardForm) => {
    if (editingEntryId) {
      updateEntry(editingEntryId, form);
    } else {
      addEntry(form);
    }
    handleCloseWizard();
  };

  const editingEntry = entries.find((entry) => entry.id === editingEntryId);
  const initialFormData: WizardForm | undefined = editingEntry
    ? {
        containerName: editingEntry.containerName,
        imageName: editingEntry.imageName,
        tagName: editingEntry.tagName,
        removeAfterStop: editingEntry.removeAfterStop,
        publishPorts: editingEntry.publishPorts,
        hostPort: editingEntry.hostPort,
        containerPort: editingEntry.containerPort,
        bindVolume: editingEntry.bindVolume,
        bindVolumes: editingEntry.bindVolumes,
        gpuMode: editingEntry.gpuMode,
        gpuIds: editingEntry.gpuIds,
        runMode: editingEntry.runMode,
        command: editingEntry.command,
      }
    : undefined;

  return (
    <Box className="app-shell">
      <AppBar position="sticky" color="primary" elevation={0}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h6">Docker Run Wizard</Typography>
            <Typography variant="body2" color="text.secondary">
              docker run コマンドをステップで構築
            </Typography>
          </Box>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#ffffff",
              color: "primary.main",
              "&:hover": {
                backgroundColor: "#eef7fb",
              },
            }}
            startIcon={<AddIcon />}
            onClick={handleOpenWizard}
          >
            新規作成
          </Button>
        </Toolbar>
      </AppBar>

      <CommandList
        entries={entries}
        onCreateClick={handleOpenWizard}
        onEditClick={handleEditEntry}
      />

      <WizardDialog
        open={wizardOpen}
        onClose={handleCloseWizard}
        onSave={handleSaveWizard}
        initialFormData={initialFormData}
        mode={editingEntryId ? "edit" : "create"}
      />
    </Box>
  );
}
