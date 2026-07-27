import type { StorageAdapter } from "../storage/storageAdapter";
import { storage } from "../storage/storageAdapter";
import type { GamificationState } from "@/domain/gamification";
import { createInitialGamificationState } from "@/domain/gamification";
import type { IGamificationRepository } from "./interfaces";

const KEY = "gamification";

/** Guest/local path — gamification state persisted to localStorage. */
export class LocalGamificationRepository implements IGamificationRepository {
  constructor(private readonly adapter: StorageAdapter = storage) {}

  async get(): Promise<GamificationState> {
    return this.adapter.get<GamificationState>(KEY) ?? createInitialGamificationState();
  }

  async save(state: GamificationState): Promise<void> {
    this.adapter.set(KEY, state);
  }

  async reset(): Promise<void> {
    this.adapter.remove(KEY);
  }
}

export const localGamificationRepository = new LocalGamificationRepository();
