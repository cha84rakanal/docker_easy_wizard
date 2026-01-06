export type GpuMode = "none" | "all" | "custom";

export type RunMode = "detach" | "interactive";

export type WizardForm = {
  containerName: string;
  imageName: string;
  tagName: string;
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

export type CommandEntry = WizardForm & {
  id: string;
  commandLine: string;
};

export const initialForm: WizardForm = {
  containerName: "",
  imageName: "",
  tagName: "latest",
  removeAfterStop: false,
  publishPorts: false,
  hostPort: "",
  containerPort: "",
  bindVolume: false,
  hostPath: "",
  containerPath: "",
  gpuMode: "none",
  gpuIds: "",
  runMode: "interactive",
  command: "",
};

export const buildDockerRunCommand = (form: WizardForm) => {
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
    const baseImage = form.imageName.trim();
    const tagName = form.tagName.trim() || "latest";
    const imageWithTag = baseImage.includes(":")
      ? baseImage
      : `${baseImage}:${tagName}`;
    parts.push(imageWithTag);
  }

  if (form.command.trim()) {
    parts.push(form.command.trim());
  }

  return parts.join(" ");
};
