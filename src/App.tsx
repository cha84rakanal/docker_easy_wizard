import { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CommandList from "./components/CommandList";
import WizardDialog from "./components/WizardDialog";
import type { CommandEntry, WizardForm } from "./models/command";
import { useCommandStore } from "./store/commandStore";

export default function App() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CommandEntry | null>(null);
  const [duplicateTarget, setDuplicateTarget] = useState<CommandEntry | null>(null);
  const [duplicateName, setDuplicateName] = useState("");
  const { entries, addEntry, updateEntry, removeEntry, duplicateEntry } =
    useCommandStore();

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

  const handleDeleteEntry = (entry: CommandEntry) => {
    setDeleteTarget(entry);
  };

  const handleDuplicateEntry = (entry: CommandEntry) => {
    setDuplicateTarget(entry);
    setDuplicateName(entry.containerName || "");
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      removeEntry(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDuplicate = () => {
    if (duplicateTarget) {
      const trimmedName = duplicateName.trim();
      duplicateEntry(
        duplicateTarget,
        trimmedName || `${duplicateTarget.containerName}-copy`
      );
    }
    setDuplicateTarget(null);
    setDuplicateName("");
  };

  const handleCancelDuplicate = () => {
    setDuplicateTarget(null);
    setDuplicateName("");
  };

  const editingEntry = entries.find((entry) => entry.id === editingEntryId);
  const initialFormData: WizardForm | undefined = editingEntry
    ? {
        memo: editingEntry.memo,
        containerName: editingEntry.containerName,
        imageName: editingEntry.imageName,
        tagName: editingEntry.tagName,
        removeAfterStop: editingEntry.removeAfterStop,
        privileged: editingEntry.privileged,
        envVars: editingEntry.envVars,
        publishPorts: editingEntry.publishPorts,
        portBindings: editingEntry.portBindings,
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
        onDeleteClick={handleDeleteEntry}
        onDuplicateClick={handleDuplicateEntry}
      />

      <WizardDialog
        open={wizardOpen}
        onClose={handleCloseWizard}
        onSave={handleSaveWizard}
        initialFormData={initialFormData}
        mode={editingEntryId ? "edit" : "create"}
      />
      <Dialog open={Boolean(deleteTarget)} onClose={handleCancelDelete}>
        <DialogTitle>削除の確認</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {deleteTarget?.containerName || "コンテナ名未設定"} のコマンドを削除します。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>キャンセル</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>
            削除する
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={Boolean(duplicateTarget)} onClose={handleCancelDuplicate}>
        <DialogTitle>コピーの作成</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            コンテナ名のみ変更できます。
          </Typography>
          <TextField
            label="コンテナ名"
            value={duplicateName}
            onChange={(event) => setDuplicateName(event.target.value)}
            fullWidth
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDuplicate}>キャンセル</Button>
          <Button
            variant="contained"
            onClick={handleConfirmDuplicate}
            disabled={!duplicateName.trim()}
          >
            作成する
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
