import type { SrsCard } from "@/domain/srs";
import { createInitialCard } from "@/domain/srs";
import type { VerbField } from "@/domain/verb";
import type { IProgressRepository } from "../interfaces";
import { requireSupabaseContext } from "./supabaseHelpers";

interface SrsCardRow {
  verb_id: string;
  field: string;
  interval_days: number;
  ease_factor: number;
  repetitions: number;
  confidence: number;
  last_reviewed_at: string | null;
  next_review_at: string;
  total_attempts: number;
  total_correct: number;
}

function fromRow(row: SrsCardRow): SrsCard {
  return {
    verbId: row.verb_id,
    field: row.field as VerbField,
    intervalDays: row.interval_days,
    easeFactor: row.ease_factor,
    repetitions: row.repetitions,
    confidence: row.confidence,
    lastReviewedAt: row.last_reviewed_at,
    nextReviewAt: row.next_review_at,
    totalAttempts: row.total_attempts,
    totalCorrect: row.total_correct,
  };
}

function toRow(card: SrsCard, userId: string) {
  return {
    user_id: userId,
    verb_id: card.verbId,
    field: card.field,
    interval_days: card.intervalDays,
    ease_factor: card.easeFactor,
    repetitions: card.repetitions,
    confidence: card.confidence,
    last_reviewed_at: card.lastReviewedAt,
    next_review_at: card.nextReviewAt,
    total_attempts: card.totalAttempts,
    total_correct: card.totalCorrect,
  };
}

/** Signed-in path — SRS cards persisted to the `srs_cards` table (RLS-scoped to the current user). */
export class SupabaseProgressRepository implements IProgressRepository {
  async getAll(): Promise<SrsCard[]> {
    const { client, userId } = requireSupabaseContext();
    const { data, error } = await client.from("srs_cards").select("*").eq("user_id", userId);
    if (error) throw error;
    return (data as SrsCardRow[]).map(fromRow);
  }

  async getOrCreate(verbId: string, field: VerbField): Promise<SrsCard> {
    const { client, userId } = requireSupabaseContext();
    const { data, error } = await client
      .from("srs_cards")
      .select("*")
      .eq("user_id", userId)
      .eq("verb_id", verbId)
      .eq("field", field)
      .maybeSingle();
    if (error) throw error;
    if (data) return fromRow(data as SrsCardRow);

    const card = createInitialCard(verbId, field, new Date());
    await this.save(card);
    return card;
  }

  async save(card: SrsCard): Promise<void> {
    const { client, userId } = requireSupabaseContext();
    const { error } = await client.from("srs_cards").upsert(toRow(card, userId), { onConflict: "user_id,verb_id,field" });
    if (error) throw error;
  }

  async getForVerb(verbId: string): Promise<SrsCard[]> {
    const { client, userId } = requireSupabaseContext();
    const { data, error } = await client
      .from("srs_cards")
      .select("*")
      .eq("user_id", userId)
      .eq("verb_id", verbId);
    if (error) throw error;
    return (data as SrsCardRow[]).map(fromRow);
  }

  async reset(): Promise<void> {
    const { client, userId } = requireSupabaseContext();
    const { error } = await client.from("srs_cards").delete().eq("user_id", userId);
    if (error) throw error;
  }
}

export const supabaseProgressRepository = new SupabaseProgressRepository();
