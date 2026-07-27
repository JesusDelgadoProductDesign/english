import verbsData from "@/data/verbs.json";
import type { Verb } from "@/domain/verb";

const verbs = verbsData as Verb[];

/**
 * Static dataset access. Today this reads a bundled JSON file produced by
 * `scripts/import-verbs.ts`; if the app later needs a real backend, this is
 * the only module that would change (e.g. to fetch from an API).
 */
export class VerbRepository {
  getAll(): Verb[] {
    return verbs;
  }

  getById(id: string): Verb | undefined {
    return verbs.find((v) => v.id === id);
  }
}

export const verbRepository = new VerbRepository();
