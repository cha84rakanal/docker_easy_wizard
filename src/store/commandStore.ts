import { useEffect, useMemo, useState } from "react";
import {
  buildDockerRunCommand,
  type CommandEntry,
  type WizardForm,
} from "../models/command";

const STORAGE_KEY = "docker-wizard-entries-v1";

const createCommandEntry = (form: WizardForm): CommandEntry => ({
  ...form,
  id: crypto.randomUUID(),
  commandLine: buildDockerRunCommand(form),
});

const hydrateEntries = (entries: CommandEntry[]) =>
  entries.map((entry) => ({
    ...entry,
    commandLine: entry.commandLine || buildDockerRunCommand(entry),
    tagName: entry.tagName || "latest",
  }));

const loadEntries = (): CommandEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as CommandEntry[];
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, serializedEntries);
  }, [serializedEntries]);

  return {
    entries,
    addEntry,
  };
};

export type { GpuMode, RunMode };
