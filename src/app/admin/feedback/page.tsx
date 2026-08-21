import type { Metadata } from "next";
import { getAllFeedback } from "@/actions/feedback";
import { getAllSupportRequests } from "@/actions/support-requests";
import { FeedbackPageClient } from "./FeedbackPageClient";

export const metadata: Metadata = { title: "Feedback & Support" };
export const revalidate = 0;

export default async function AdminFeedbackPage() {
  const [feedbackItems, supportItems] = await Promise.all([
    getAllFeedback(),
    getAllSupportRequests(),
  ]);

  const totalItems   = feedbackItems.length + supportItems.length;
  const totalUnread  = feedbackItems.filter((f) => !f.isReadAdmin).length
                     + supportItems.filter((r) => !r.isReadAdmin).length;

  return (
    <div>
      <FeedbackPageClient
        feedbackItems={feedbackItems}
        supportItems={supportItems}
      />
    </div>
  );
}
