import { useState } from "react";

type GpuMode = "none" | "all" | "custom";

type RunMode = "detach" | "interactive";

export type WizardForm = {
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

export type CommandEntry = WizardForm & {
  id: string;
  commandLine: string;
};

export const initialForm: WizardForm = {
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
    parts.push(form.imageName.trim());
  }

  if (form.command.trim()) {
    parts.push(form.command.trim());
  }

  return parts.join(" ");
};

const createCommandEntry = (form: WizardForm): CommandEntry => ({
  ...form,
  id: crypto.randomUUID(),
  commandLine: buildDockerRunCommand(form),
});

export const useCommandStore = () => {
  const [entries, setEntries] = useState<CommandEntry[]>([]);

  const addEntry = (form: WizardForm) => {
    setEntries((prev) => [createCommandEntry(form), ...prev]);
  };

  return {
    entries,
    addEntry,
  };
};

export type { GpuMode, RunMode };
