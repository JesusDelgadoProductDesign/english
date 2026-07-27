import type { StorageAdapter } from "../storage/storageAdapter";
import { storage } from "../storage/storageAdapter";
import type { SrsCard } from "@/domain/srs";
import { createInitialCard } from "@/domain/srs";
import type { VerbField } from "@/domain/verb";
import type { IProgressRepository } from "./interfaces";

const KEY = "srs-cards";

function cardKey(verbId: string, field: VerbField): string {
  return `${verbId}:${field}`;
}

/** Guest/local path — SRS cards persisted to localStorage. */
export class LocalProgressRepository implements IProgressRepository {
  constructor(private readonly adapter: StorageAdapter = storage) {}

  private readAll(): Record<string, SrsCard> {
    return this.adapter.get<Record<string, SrsCard>>(KEY) ?? {};
  }

  private writeAll(cards: Record<string, SrsCard>): void {
    this.adapter.set(KEY, cards);
  }

  async getAll(): Promise<SrsCard[]> {
    return Object.values(this.readAll());
  }

  async getOrCreate(verbId: string, field: VerbField): Promise<SrsCard> {
    const all = this.readAll();
    const key = cardKey(verbId, field);
    if (all[key]) return all[key];
    const card = createInitialCard(verbId, field, new Date());
    all[key] = card;
    this.writeAll(all);
    return card;
  }

  async save(card: SrsCard): Promise<void> {
    const all = this.readAll();
    all[cardKey(card.verbId, card.field)] = card;
    this.writeAll(all);
  }

  async getForVerb(verbId: string): Promise<SrsCard[]> {
    return (await this.getAll()).filter((c) => c.verbId === verbId);
  }

  async reset(): Promise<void> {
    this.adapter.remove(KEY);
  }
}

export const localProgressRepository = new LocalProgressRepository();
