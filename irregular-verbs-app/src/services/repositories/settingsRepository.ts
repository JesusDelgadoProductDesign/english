import type { StorageAdapter } from "../storage/storageAdapter";
import { storage } from "../storage/storageAdapter";
import type { UserSettings } from "@/domain/settings";
import { createDefaultSettings } from "@/domain/settings";
import type { ISettingsRepository } from "./interfaces";

const KEY = "settings";

/** Guest/local path — settings persisted to localStorage. */
export class LocalSettingsRepository implements ISettingsRepository {
  constructor(private readonly adapter: StorageAdapter = storage) {}

  async get(): Promise<UserSettings> {
    const stored = this.adapter.get<UserSettings>(KEY);
    return stored ? { ...createDefaultSettings(), ...stored } : createDefaultSettings();
  }

  async save(settings: UserSettings): Promise<void> {
    this.adapter.set(KEY, settings);
  }

  async reset(): Promise<void> {
    this.adapter.remove(KEY);
  }
}

export const localSettingsRepository = new LocalSettingsRepository();
