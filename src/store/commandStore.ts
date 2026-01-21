import { useEffect, useMemo, useState } from "react";
import {
  buildDockerRunCommand,
  type CommandEntry,
  type EnvVar,
  type PortBinding,
  type VolumeBinding,
  type WizardForm,
} from "../models/command";

const STORAGE_KEY = "docker-wizard-entries-v1";

const createCommandEntry = (form: WizardForm): CommandEntry => ({
  ...form,
  id: crypto.randomUUID(),
  commandLine: buildDockerRunCommand(form),
});

const cloneCommandEntry = (entry: CommandEntry, containerName: string): CommandEntry => ({
  ...entry,
  id: crypto.randomUUID(),
  containerName,
  commandLine: buildDockerRunCommand({
    ...entry,
    containerName,
  }),
});

const updateCommandEntry = (entry: CommandEntry, form: WizardForm): CommandEntry => ({
  ...entry,
  ...form,
  commandLine: buildDockerRunCommand(form),
});

type LegacyEntry = CommandEntry & {
  hostPort?: string;
  containerPort?: string;
  portBindings?: PortBinding[];
  hostPath?: string;
  containerPath?: string;
  bindVolumes?: VolumeBinding[];
  envVars?: EnvVar[];
  privileged?: boolean;
};

const ensureEnvVars = (entry: LegacyEntry): EnvVar[] => {
  if (Array.isArray(entry.envVars) && entry.envVars.length > 0) {
    return entry.envVars;
  }
  return [{ key: "", value: "" }];
};

const ensurePortBindings = (entry: LegacyEntry): PortBinding[] => {
  if (Array.isArray(entry.portBindings) && entry.portBindings.length > 0) {
    return entry.portBindings;
  }
  if (entry.hostPort || entry.containerPort) {
    return [
      {
        hostPort: entry.hostPort ?? "",
        containerPort: entry.containerPort ?? "",
      },
    ];
  }
  return [{ hostPort: "", containerPort: "" }];
};

const ensureBindVolumes = (entry: LegacyEntry): VolumeBinding[] => {
  if (Array.isArray(entry.bindVolumes) && entry.bindVolumes.length > 0) {
    return entry.bindVolumes;
  }
  if (entry.hostPath || entry.containerPath) {
    return [
      {
        hostPath: entry.hostPath ?? "",
        containerPath: entry.containerPath ?? "",
      },
    ];
  }
  return [{ hostPath: "", containerPath: "" }];
};

const hydrateEntries = (entries: LegacyEntry[]) =>
  entries.map((entry) => {
    const normalized: CommandEntry = {
      ...entry,
      memo: entry.memo ?? "",
      privileged: Boolean(entry.privileged),
      envVars: ensureEnvVars(entry),
      portBindings: ensurePortBindings(entry),
      bindVolumes: ensureBindVolumes(entry),
      tagName: entry.tagName || "latest",
      commandLine: entry.commandLine || "",
    };
    return {
      ...normalized,
      commandLine: normalized.commandLine || buildDockerRunCommand(normalized),
    };
  });

const loadEntries = (): CommandEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as LegacyEntry[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return hydrateEntries(parsed);
  } catch {
    return [];
  }
};

export const useCommandStore = () => {
  const [entries, setEntries] = useState<CommandEntry[]>(() => loadEntries());
  const serializedEntries = useMemo(() => JSON.stringify(entries), [entries]);

  const addEntry = (form: WizardForm) => {
    setEntries((prev) => [createCommandEntry(form), ...prev]);
  };

  const updateEntry = (id: string, form: WizardForm) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === id ? updateCommandEntry(entry, form) : entry))
    );
  };

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const duplicateEntry = (entry: CommandEntry, containerName: string) => {
    setEntries((prev) => [cloneCommandEntry(entry, containerName), ...prev]);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, serializedEntries);
  }, [serializedEntries]);

  return {
    entries,
    addEntry,
    updateEntry,
    removeEntry,
    duplicateEntry,
  };
};
