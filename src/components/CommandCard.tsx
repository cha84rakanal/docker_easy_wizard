import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { CommandEntry } from "../models/command";

type CommandCardProps = {
  entry: CommandEntry;
  onEditClick: (entry: CommandEntry) => void;
  onDeleteClick: (entry: CommandEntry) => void;
  onDuplicateClick: (entry: CommandEntry) => void;
};

export default function CommandCard({
  entry,
  onEditClick,
  onDeleteClick,
  onDuplicateClick,
}: CommandCardProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return undefined;
    }
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const getImageLabel = () => {
    if (!entry.imageName.trim()) {
      return "イメージ未設定";
    }
    const tagName = entry.tagName.trim() || "latest";
    return entry.imageName.includes(":")
      ? entry.imageName
      : `${entry.imageName}:${tagName}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(entry.commandLine);
      setCopied(true);
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
      setCopied(true);
    }
  };

  return (
    <Card className="card-rise">
      <CardHeader
        title={entry.containerName || "コンテナ名未設定"}
        subheader={getImageLabel()}
        action={
          <Stack direction="row" spacing={1}>
            <IconButton aria-label="edit" onClick={() => onEditClick(entry)}>
              <EditIcon />
            </IconButton>
            <IconButton aria-label="duplicate" onClick={() => onDuplicateClick(entry)}>
              <FileCopyIcon />
            </IconButton>
            <IconButton aria-label="delete" onClick={() => onDeleteClick(entry)}>
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
          <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
            {entry.removeAfterStop && <Chip label="--rm" />}
            <Chip label={entry.runMode === "detach" ? "-d" : "-it"} />
            {entry.privileged && <Chip label="--privileged" />}
            {entry.publishPorts &&
              entry.portBindings
                .filter(
                  (binding) =>
                    binding.hostPort.trim() && binding.containerPort.trim()
                )
                .map((binding, index) => (
                  <Chip
                    key={`port-${entry.id}-${index}`}
                    label={`-p ${binding.hostPort}:${binding.containerPort}`}
                  />
                ))}
            {entry.envVars
              .filter((envVar) => envVar.key.trim())
              .map((envVar, index) => (
                <Chip
                  key={`env-${entry.id}-${index}`}
                  label={`-e ${envVar.key}${envVar.value ? `=${envVar.value}` : ""}`}
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
              <Tooltip title={copied ? "コピーしました" : "コピー"} arrow>
                <IconButton size="small" onClick={handleCopy} aria-label="copy">
                  {copied ? (
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
  );
}
