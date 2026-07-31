import { supabase } from "@/services/supabase/client";
import type { FeedbackCategory } from "@/domain/feedback";

interface SubmitFeedbackInput {
  category: FeedbackCategory;
  message: string;
  contactEmail: string;
  page: string;
  language: string;
}

/**
 * Insert-only by design (see supabase/migrations/003_feedback.sql) — works for
 * signed-in, anonymous, and fully logged-out visitors alike. user_id is only
 * attached for a real (non-anonymous) sign-in, so it doubles as a signed-in
 * vs. guest signal without a dedicated column.
 */
export async function submitFeedback(input: SubmitFeedbackInput): Promise<void> {
  if (!supabase) throw new Error("Feedback is not available right now.");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("feedback_submissions").insert({
    user_id: user && !user.is_anonymous ? user.id : null,
    category: input.category,
    message: input.message,
    contact_email: input.contactEmail.trim() || null,
    page: input.page,
    language: input.language,
    user_agent: window.navigator.userAgent,
  });
  if (error) throw error;
}
