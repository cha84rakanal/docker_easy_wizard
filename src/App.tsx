import { useMemo, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Checkbox,
  Collapse,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

const steps = ["基本情報", "詳細オプション", "コマンド"];

type GpuMode = "none" | "all" | "custom";

type RunMode = "detach" | "interactive";

type WizardForm = {
  containerName: string;
  imageName: string;
  removeAfterStop: boolean;
  publishPorts: boolean;
  hostPort: string;
  containerPort: string;
  bindVolume: boolean;
  hostPath: string;
  containerPath: string;
  gpuMode: GpuMode;
  gpuIds: string;
  runMode: RunMode;
  command: string;
};

type CommandEntry = WizardForm & {
  id: string;
  commandLine: string;
};

const initialForm: WizardForm = {
  containerName: "",
  imageName: "",
  removeAfterStop: false,
  publishPorts: false,
  hostPort: "",
  containerPort: "",
  bindVolume: false,
  hostPath: "",
  containerPath: "",
  gpuMode: "none",
  gpuIds: "",
  runMode: "detach",
  command: "",
};

const buildDockerRunCommand = (form: WizardForm) => {
  const parts: string[] = ["docker", "run"];

  if (form.removeAfterStop) {
    parts.push("--rm");
  }

  if (form.runMode === "detach") {
    parts.push("-d");
  } else {
    parts.push("-it");
  }

  if (form.containerName.trim()) {
    parts.push("--name", form.containerName.trim());
  }

  if (form.publishPorts && form.hostPort.trim() && form.containerPort.trim()) {
    parts.push(`-p ${form.hostPort.trim()}:${form.containerPort.trim()}`);
  }

  if (form.bindVolume && form.hostPath.trim() && form.containerPath.trim()) {
    parts.push(`-v ${form.hostPath.trim()}:${form.containerPath.trim()}`);
  }

  if (form.gpuMode === "all") {
    parts.push("--gpus", "all");
  }

  if (form.gpuMode === "custom" && form.gpuIds.trim()) {
    parts.push("--gpus", `"device=${form.gpuIds.trim()}"`);
  }

  if (form.imageName.trim()) {
    parts.push(form.imageName.trim());
  }

  if (form.command.trim()) {
    parts.push(form.command.trim());
  }

  return parts.join(" ");
};

export default function App() {
  const [entries, setEntries] = useState<CommandEntry[]>([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState<WizardForm>(initialForm);

  const commandPreview = useMemo(() => buildDockerRunCommand(form), [form]);

  const handleOpenWizard = () => {
    setWizardOpen(true);
  };

  const handleCloseWizard = () => {
    setWizardOpen(false);
    setActiveStep(0);
    setForm(initialForm);
  };

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleFinish = () => {
    const id = crypto.randomUUID();
    const commandLine = buildDockerRunCommand(form);
    setEntries((prev) => [
      {
        ...form,
        id,
        commandLine,
      },
      ...prev,
    ]);
    handleCloseWizard();
  };

  const isStepOneValid = form.imageName.trim().length > 0;

  return (
    <Box className="app-shell">
      <AppBar position="sticky" color="transparent" elevation={0}>
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
                        onClick={handleOpenWizard}
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
                                <Chip
                                  label={`-p ${entry.hostPort}:${entry.containerPort}`}
                                />
                              )}
                            {entry.bindVolume &&
                              entry.hostPath.trim() &&
                              entry.containerPath.trim() && (
                                <Chip
                                  label={`-v ${entry.hostPath}:${entry.containerPath}`}
                                />
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

      <Dialog open={wizardOpen} onClose={handleCloseWizard} fullWidth maxWidth="md">
        <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
          Wizardでdocker runを構築
          <IconButton
            onClick={handleCloseWizard}
            sx={{ marginLeft: "auto" }}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {activeStep === 0 && (
              <Stack spacing={2}>
                <TextField
                  label="コンテナ名"
                  value={form.containerName}
                  placeholder="my-container"
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, containerName: event.target.value }))
                  }
                  fullWidth
                />
                <TextField
                  label="イメージ名"
                  value={form.imageName}
                  placeholder="nginx:latest"
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, imageName: event.target.value }))
                  }
                  required
                  fullWidth
                />
              </Stack>
            )}

            {activeStep === 1 && (
              <Stack spacing={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.removeAfterStop}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          removeAfterStop: event.target.checked,
                        }))
                      }
                    />
                  }
                  label="停止後にコンテナを削除する (--rm)"
                />

                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.publishPorts}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            publishPorts: event.target.checked,
                          }))
                        }
                      />
                    }
                    label="外部からアクセスする"
                  />
                  <Collapse in={form.publishPorts}>
                    <Grid container spacing={2} sx={{ marginTop: 1 }}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="ローカルポート"
                          value={form.hostPort}
                          onChange={(event) =>
                            setForm((prev) => ({ ...prev, hostPort: event.target.value }))
                          }
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="コンテナポート"
                          value={form.containerPort}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              containerPort: event.target.value,
                            }))
                          }
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  </Collapse>
                </Box>

                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.bindVolume}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            bindVolume: event.target.checked,
                          }))
                        }
                      />
                    }
                    label="ファイルにアクセスする"
                  />
                  <Collapse in={form.bindVolume}>
                    <Grid container spacing={2} sx={{ marginTop: 1 }}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="ローカルパス"
                          value={form.hostPath}
                          onChange={(event) =>
                            setForm((prev) => ({ ...prev, hostPath: event.target.value }))
                          }
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="コンテナパス"
                          value={form.containerPath}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              containerPath: event.target.value,
                            }))
                          }
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  </Collapse>
                </Box>

                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="gpu-select-label">GPU使用</InputLabel>
                      <Select
                        labelId="gpu-select-label"
                        label="GPU使用"
                        value={form.gpuMode}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            gpuMode: event.target.value as GpuMode,
                          }))
                        }
                      >
                        <MenuItem value="none">none</MenuItem>
                        <MenuItem value="all">all</MenuItem>
                        <MenuItem value="custom">custom</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Collapse in={form.gpuMode === "custom"}>
                      <TextField
                        label="GPU ID (例: 1,2)"
                        value={form.gpuIds}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, gpuIds: event.target.value }))
                        }
                        fullWidth
                      />
                    </Collapse>
                  </Grid>
                </Grid>

                <FormControl>
                  <Typography variant="subtitle1" gutterBottom>
                    実行モード
                  </Typography>
                  <RadioGroup
                    row
                    value={form.runMode}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        runMode: event.target.value as RunMode,
                      }))
                    }
                  >
                    <FormControlLabel
                      value="detach"
                      control={<Radio />}
                      label="デタッチ (-d)"
                    />
                    <FormControlLabel
                      value="interactive"
                      control={<Radio />}
                      label="インタラクティブ (-it)"
                    />
                  </RadioGroup>
                </FormControl>
              </Stack>
            )}

            {activeStep === 2 && (
              <Stack spacing={2}>
                <TextField
                  label="実行コマンド"
                  value={form.command}
                  placeholder="bash"
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, command: event.target.value }))
                  }
                  helperText="空欄の場合はイメージのデフォルトCMDを使用"
                  fullWidth
                />
                <Divider />
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    プレビュー
                  </Typography>
                  <Box
                    sx={{
                      backgroundColor: "#f6f4ee",
                      borderRadius: 2,
                      padding: 2,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "0.95rem",
                      wordBreak: "break-all",
                    }}
                  >
                    {commandPreview}
                  </Box>
                </Box>
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ padding: 3, justifyContent: "space-between" }}>
          <Button onClick={handleBack} disabled={activeStep === 0}>
            戻る
          </Button>
          <Stack direction="row" spacing={1}>
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={activeStep === 0 && !isStepOneValid}
              >
                次へ
              </Button>
            ) : (
              <Button variant="contained" color="secondary" onClick={handleFinish}>
                完了して保存
              </Button>
            )}
          </Stack>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
