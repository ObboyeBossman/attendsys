"use client";

import { useState } from "react";
import type { AdminFeedbackItem } from "@/actions/feedback";
import type { SupportRequestItem } from "@/actions/support-requests";
import { FeedbackInboxClient } from "./FeedbackInboxClient";
import { SupportRequestsInboxClient } from "./SupportRequestsInboxClient";
import srStyles from "./SupportInboxTabs.module.css";

type Tab = "feedback" | "support";

interface FeedbackPageClientProps {
  feedbackItems: AdminFeedbackItem[];
  supportItems: SupportRequestItem[];
}

export function FeedbackPageClient({ feedbackItems, supportItems }: FeedbackPageClientProps) {
  const [tab, setTab] = useState<Tab>("feedback");

  const feedbackUnread = feedbackItems.filter((f) => !f.isReadAdmin).length;
  const supportUnread  = supportItems.filter((r) => !r.isReadAdmin).length;

  return (
    <div>
      {/* ── Tab switcher ──────────────────────────────────────── */}
      <div className={srStyles.tabs}>
        <button
          className={`${srStyles.tab} ${tab === "feedback" ? srStyles.tabActive : ""}`}
          onClick={() => setTab("feedback")}
        >
          Feedback
          {feedbackUnread > 0 && (
            <span className={srStyles.badge}>{feedbackUnread}</span>
          )}
        </button>
        <button
          className={`${srStyles.tab} ${tab === "support" ? srStyles.tabActive : ""}`}
          onClick={() => setTab("support")}
        >
          Support Requests
          {supportUnread > 0 && (
            <span className={`${srStyles.badge} ${srStyles.badgeUrgent}`}>
              {supportUnread}
            </span>
          )}
        </button>
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      {tab === "feedback" && <FeedbackInboxClient items={feedbackItems} />}
      {tab === "support"  && <SupportRequestsInboxClient items={supportItems} />}
    </div>
  );
}
