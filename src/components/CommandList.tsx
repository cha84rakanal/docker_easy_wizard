import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import type { CommandEntry } from "../models/command";

type CommandListProps = {
  entries: CommandEntry[];
  onCreateClick: () => void;
  onEditClick: (entry: CommandEntry) => void;
  onDeleteClick: (entry: CommandEntry) => void;
};

export default function CommandList({
  entries,
  onCreateClick,
  onEditClick,
  onDeleteClick,
}: CommandListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!copiedId) {
      return;
    }
    const timer = window.setTimeout(() => setCopiedId(null), 1600);
    return () => window.clearTimeout(timer);
  }, [copiedId]);

  const getImageLabel = (entry: CommandEntry) => {
    if (!entry.imageName.trim()) {
      return "イメージ未設定";
    }
    const tagName = entry.tagName.trim() || "latest";
    return entry.imageName.includes(":")
      ? entry.imageName
      : `${entry.imageName}:${tagName}`;
  };

  const handleCopy = async (entry: CommandEntry) => {
    try {
      await navigator.clipboard.writeText(entry.commandLine);
      setCopiedId(entry.id);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = entry.commandLine;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedId(entry.id);
    }
  };

  return (
    <Box className="hero">
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              実行コマンド一覧
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Wizardで作成した docker run コマンドをまとめて管理します。
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {entries.length === 0 ? (
              <Grid item xs={12}>
                <Card className="card-rise" sx={{ borderStyle: "dashed" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      まだ登録がありません
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      右上の「新規作成」からWizardを開始してください。
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={onCreateClick}
                    >
                      Wizardを開く
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ) : (
              entries.map((entry) => (
                <Grid item xs={12} md={6} key={entry.id}>
                  <Card className="card-rise">
                    <CardHeader
                      title={entry.containerName || "コンテナ名未設定"}
                      subheader={getImageLabel(entry)}
                      action={
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            aria-label="edit"
                            onClick={() => onEditClick(entry)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            aria-label="delete"
                            onClick={() => onDeleteClick(entry)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      }
                    />
                    <CardContent>
                      <Stack spacing={2}>
                        {entry.memo.trim() && (
                          <Typography variant="body2" color="text.secondary">
                            {entry.memo}
                          </Typography>
                        )}
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {entry.removeAfterStop && <Chip label="--rm" />}
                          <Chip label={entry.runMode === "detach" ? "-d" : "-it"} />
                          {entry.publishPorts &&
                            entry.portBindings
                              .filter(
                                (binding) =>
                                  binding.hostPort.trim() &&
                                  binding.containerPort.trim()
                              )
                              .map((binding, index) => (
                                <Chip
                                  key={`port-${entry.id}-${index}`}
                                  label={`-p ${binding.hostPort}:${binding.containerPort}`}
                                />
                              ))}
                          {entry.bindVolume &&
                            entry.bindVolumes
                              .filter(
                                (binding) =>
                                  binding.hostPath.trim() && binding.containerPath.trim()
                              )
                              .map((binding, index) => (
                                <Chip
                                  key={`bind-${entry.id}-${index}`}
                                  label={`-v ${binding.hostPath}:${binding.containerPath}`}
                                />
                              ))}
                          {entry.gpuMode === "all" && <Chip label="--gpus all" />}
                          {entry.gpuMode === "custom" && entry.gpuIds.trim() && (
                            <Chip label={`--gpus device=${entry.gpuIds}`} />
                          )}
                        </Stack>
                        <Box
                          sx={{
                            backgroundColor: "#f6f4ee",
                            borderRadius: 2,
                            padding: 2,
                            paddingRight: 5,
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: "0.9rem",
                            wordBreak: "break-all",
                            position: "relative",
                          }}
                        >
                          {entry.commandLine}
                          <Box
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                            }}
                          >
                            <Tooltip
                              title={copiedId === entry.id ? "コピーしました" : "コピー"}
                              arrow
                            >
                              <IconButton
                                size="small"
                                onClick={() => handleCopy(entry)}
                                aria-label="copy"
                              >
                                {copiedId === entry.id ? (
                                  <CheckCircleIcon fontSize="small" color="success" />
                                ) : (
                                  <ContentCopyIcon fontSize="small" />
                                )}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}
