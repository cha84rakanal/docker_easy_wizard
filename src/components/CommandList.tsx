import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import type { CommandEntry } from "../store/commandStore";

type CommandListProps = {
  entries: CommandEntry[];
  onCreateClick: () => void;
};

export default function CommandList({ entries, onCreateClick }: CommandListProps) {
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
                      subheader={entry.imageName || "イメージ未設定"}
                    />
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {entry.removeAfterStop && <Chip label="--rm" />}
                          <Chip label={entry.runMode === "detach" ? "-d" : "-it"} />
                          {entry.publishPorts &&
                            entry.hostPort.trim() &&
                            entry.containerPort.trim() && (
                              <Chip label={`-p ${entry.hostPort}:${entry.containerPort}`} />
                            )}
                          {entry.bindVolume &&
                            entry.hostPath.trim() &&
                            entry.containerPath.trim() && (
                              <Chip label={`-v ${entry.hostPath}:${entry.containerPath}`} />
                            )}
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
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: "0.9rem",
                            wordBreak: "break-all",
                          }}
                        >
                          {entry.commandLine}
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
