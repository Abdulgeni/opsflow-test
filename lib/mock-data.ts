// ── Workflow ────────────────────────────────────────────────
export interface WorkflowSummary {
  id: string;
  title: string;
  stages: string[];
  currentStageIndex: number;
  createdAt: string;
  auditTrail: { fromStage: string; toStage: string; actor: string; comment: string; date: string }[];
  comments: { author: string; timeAgo: string; text: string }[];
}

export const MOCK_WORKFLOWS: WorkflowSummary[] = [
  {
    id: "WF-72810",
    title: "Lease Approval - Alpha Towers",
    stages: ["Submitted", "Manager Review", "Finance Review", "Approved"],
    currentStageIndex: 2,
    createdAt: "Oct 14, 2023",
    auditTrail: [
      { fromStage: "Submitted", toStage: "Manager Review", actor: "Sarah Jenkins", comment: "Initial documents uploaded for commercial lease #A-774.", date: "Oct 14, 2023 - 09:15 AM" },
      { fromStage: "Manager Review", toStage: "Finance Review", actor: "Marcus Chen", comment: "Terms reviewed. Forwarding to finance for final yield analysis.", date: "Oct 15, 2023 - 14:30 PM" },
    ],
    comments: [
      { author: "Sarah Jenkins", timeAgo: "2 days ago", text: "Hey Marcus, I noticed the tenant requested a different base year for OPEX." },
      { author: "Marcus Chen", timeAgo: "Yesterday", text: "Thanks Sarah. It pushes our margins a bit close." },
    ],
  },
  {
    id: "WF-72811",
    title: "Maintenance Vendor Approval - Oakwood Manor",
    stages: ["Submitted", "Manager Review", "Approved"],
    currentStageIndex: 1,
    createdAt: "Oct 18, 2023",
    auditTrail: [
      { fromStage: "Submitted", toStage: "Manager Review", actor: "David Chen", comment: "Vendor quote attached for HVAC replacement.", date: "Oct 18, 2023 - 10:02 AM" },
    ],
    comments: [
      { author: "David Chen", timeAgo: "3 hours ago", text: "Waiting on manager sign-off before we schedule the vendor." },
    ],
  },
  {
    id: "WF-72812",
    title: "New Client Onboarding - Global Logistics",
    stages: ["Submitted", "Manager Review", "Finance Review", "Approved"],
    currentStageIndex: 3,
    createdAt: "Oct 05, 2023",
    auditTrail: [
      { fromStage: "Submitted", toStage: "Manager Review", actor: "Marcus Sterling", comment: "Onboarding packet submitted.", date: "Oct 05, 2023 - 09:00 AM" },
      { fromStage: "Manager Review", toStage: "Finance Review", actor: "Eleanor Vance", comment: "Approved, forwarding for credit check.", date: "Oct 06, 2023 - 11:15 AM" },
      { fromStage: "Finance Review", toStage: "Approved", actor: "David Chen", comment: "Credit check clear. Fully approved.", date: "Oct 07, 2023 - 15:40 PM" },
    ],
    comments: [],
  },
];