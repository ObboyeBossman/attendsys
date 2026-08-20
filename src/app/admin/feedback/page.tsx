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
      <div className="page-header">
        <div>
          <h1 className="page-title">Feedback &amp; Support</h1>
          <p className="page-subtitle">
            {totalItems === 0
              ? "No submissions yet."
              : `${feedbackItems.length} feedback · ${supportItems.length} support request${supportItems.length !== 1 ? "s" : ""}${totalUnread > 0 ? ` · ${totalUnread} unread` : " · all read"}`}
          </p>
        </div>
      </div>

      <FeedbackPageClient
        feedbackItems={feedbackItems}
        supportItems={supportItems}
      />
    </div>
  );
}
