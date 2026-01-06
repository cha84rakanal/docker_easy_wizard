import { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Collapse,
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
  Select,
  Radio,
  RadioGroup,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  buildDockerRunCommand,
  initialForm,
  type GpuMode,
  type RunMode,
  type WizardForm,
} from "../models/command";

const steps = ["基本情報", "詳細オプション", "コマンド"];

type WizardDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (form: WizardForm) => void;
};

export default function WizardDialog({ open, onClose, onSave }: WizardDialogProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState<WizardForm>(initialForm);
  const [imageOptions, setImageOptions] = useState<string[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [tagOptions, setTagOptions] = useState<string[]>([]);
  const [tagLoading, setTagLoading] = useState(false);
  const [tagMode, setTagMode] = useState<"preset" | "other">("preset");

  const commandPreview = useMemo(() => buildDockerRunCommand(form), [form]);

  useEffect(() => {
    const query = form.imageName.trim();
    if (query.length < 4) {
      setImageOptions([]);
      setImageLoading(false);
      return;
    }

    setImageLoading(true);
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/dockerhub/v2/search/repositories/?query=${encodeURIComponent(
            query
          )}&page_size=10`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          setImageOptions([]);
          return;
        }
        const data = (await response.json()) as {
          results?: Array<{ repo_name?: string }>;
        };
        const options =
          data.results?.map((item) => item.repo_name).filter(Boolean) ?? [];
        setImageOptions(options as string[]);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setImageOptions([]);
        }
      } finally {
        setImageLoading(false);
      }
    }, 450);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [form.imageName]);

  useEffect(() => {
    const imageName = form.imageName.trim();
    const baseImage = imageName.split(":")[0];

    if (!baseImage) {
      setTagOptions([]);
      setTagLoading(false);
      setTagMode("preset");
      setForm((prev) => ({ ...prev, tagName: "latest" }));
      return;
    }

    const firstSegment = baseImage.split("/")[0];
    if (firstSegment.includes(".") || firstSegment.includes(":")) {
      setTagOptions([]);
      setTagLoading(false);
      setTagMode("preset");
      setForm((prev) => ({ ...prev, tagName: "latest" }));
      return;
    }

    const repoPath = baseImage.includes("/") ? baseImage : `library/${baseImage}`;
    const encodedRepo = repoPath
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");

    setTagLoading(true);
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/dockerhub/v2/repositories/${encodedRepo}/tags/?page_size=30&ordering=last_updated`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          setTagOptions([]);
          return;
        }
        const data = (await response.json()) as {
          results?: Array<{ name?: string }>;
        };
        const options =
          data.results?.map((item) => item.name).filter(Boolean) ?? [];
        const merged = Array.from(new Set(["latest", ...options]));
        setTagOptions(merged);
        setTagMode("preset");
        setForm((prev) => ({
          ...prev,
          tagName: merged.includes(prev.tagName) ? prev.tagName : "latest",
        }));
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setTagOptions([]);
        }
      } finally {
        setTagLoading(false);
      }
    }, 400);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [form.imageName]);

  const handleClose = () => {
    onClose();
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
    onSave(form);
    handleClose();
  };

  const isStepOneValid = form.imageName.trim().length > 0;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
        Wizardでdocker runを構築
        <IconButton onClick={handleClose} sx={{ marginLeft: "auto" }} aria-label="close">
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
              <Autocomplete
                freeSolo
                options={imageOptions}
                inputValue={form.imageName}
                onInputChange={(_, value) =>
                  setForm((prev) => ({ ...prev, imageName: value }))
                }
                loading={imageLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="イメージ名"
                    placeholder="ex) nginx, nvidia/cuda"
                    required
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {imageLoading ? (
                            <CircularProgress color="inherit" size={18} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
              <FormControl fullWidth>
                <InputLabel id="tag-select-label">タグ名</InputLabel>
                <Select
                  labelId="tag-select-label"
                  label="タグ名"
                  value={tagMode === "other" ? "__other__" : form.tagName}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === "__other__") {
                      setTagMode("other");
                      setForm((prev) => ({
                        ...prev,
                        tagName: prev.tagName || "latest",
                      }));
                      return;
                    }
                    setTagMode("preset");
                    setForm((prev) => ({ ...prev, tagName: value }));
                  }}
                  disabled={tagOptions.length === 0}
                  endAdornment={
                    tagLoading ? <CircularProgress color="inherit" size={18} /> : null
                  }
                >
                  {tagOptions.map((tag) => (
                    <MenuItem value={tag} key={tag}>
                      {tag}
                    </MenuItem>
                  ))}
                  <MenuItem value="__other__">other</MenuItem>
                </Select>
              </FormControl>
              <Collapse in={tagMode === "other"}>
                <TextField
                  label="タグ名 (自由入力)"
                  placeholder="latest"
                  value={form.tagName}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, tagName: event.target.value }))
                  }
                  fullWidth
                />
              </Collapse>
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
                  <FormControlLabel value="detach" control={<Radio />} label="デタッチ (-d)" />
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
  );
}
