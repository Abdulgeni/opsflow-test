// ── Properties ──────────────────────────────────────────────
export type PropertyStatus = "AVAILABLE" | "OCCUPIED" | "UNDER_MAINTENANCE" | "DECOMMISSIONED";
export type MaintenanceStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  status: PropertyStatus;
}

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  description: string;
  status: MaintenanceStatus;
}

export const MOCK_PROPERTIES: Property[] = [
  { id: "1", name: "The Belvedere", address: "124 Park Ave, New York", type: "Residential", status: "AVAILABLE" },
  { id: "2", name: "Skyline Plaza", address: "55 Market St, San Francisco", type: "Commercial", status: "OCCUPIED" },
  { id: "3", name: "Oakwood Manor", address: "882 Pine Ln, Seattle", type: "Residential", status: "UNDER_MAINTENANCE" },
  { id: "4", name: "Industrial Block B", address: "300 Port Rd, Houston", type: "Industrial", status: "DECOMMISSIONED" },
];

export const MOCK_MAINTENANCE: MaintenanceRequest[] = [
  { id: "m1", propertyId: "1", description: "AC Repair - Unit 4B", status: "OPEN" },
  { id: "m2", propertyId: "1", description: "Lighting Check - Main Lobby", status: "RESOLVED" },
];

// ── Clients ─────────────────────────────────────────────────
export type ClientStatus = "LEAD" | "ACTIVE" | "INACTIVE" | "ARCHIVED";

export interface Client {
  id: string;
  name: string;
  type: "Individual" | "Organization";
  email: string;
  phone: string;
  status: ClientStatus;
}

export const MOCK_CLIENTS: Client[] = [
  { id: "c1", name: "Sarah Chen", type: "Individual", email: "sarah.c@example.com", phone: "(555) 012-3456", status: "ACTIVE" },
  { id: "c2", name: "TechCorp Solutions", type: "Organization", email: "contact@techcorp.com", phone: "(555) 987-6543", status: "LEAD" },
  { id: "c3", name: "John Smith", type: "Individual", email: "j.smith@provider.net", phone: "(555) 234-5678", status: "INACTIVE" },
  { id: "c4", name: "Global Logistics", type: "Organization", email: "info@global-log.com", phone: "(555) 456-7890", status: "ARCHIVED" },
];

export interface ContactLogEntry {
  id: string;
  clientId: string;
  note: string;
  author: string;
  timeAgo: string;
}

export const MOCK_CONTACT_LOG: ContactLogEntry[] = [
  { id: "cl1", clientId: "c1", note: "Property Tour - Alpha Towers. Guided tour of units 4B and 5A.", author: "Michael Scott", timeAgo: "2 hours ago" },
  { id: "cl2", clientId: "c1", note: "Initial Consultation. Discussed portfolio requirements.", author: "Dwight Schrute", timeAgo: "Yesterday" },
];

// ── Documents ───────────────────────────────────────────────
export interface OpsDocument {
  id: string;
  title: string;
  category: string;
  linkedTo: string;
  uploadedBy: string;
  version: number;
  date: string;
}

export const MOCK_DOCUMENTS: OpsDocument[] = [
  { id: "d1", title: "Master Service Agreement.pdf", category: "Legal", linkedTo: "Sarah Chen", uploadedBy: "James Wilson", version: 2, date: "Oct 14, 2023" },
  { id: "d2", title: "Alpha Towers Site Plan.jpg", category: "Property", linkedTo: "Alpha Towers", uploadedBy: "Elena Rossi", version: 1, date: "Oct 12, 2023" },
  { id: "d3", title: "Financial Statement Q3.pdf", category: "Finance", linkedTo: "Acme Corp", uploadedBy: "Marcus Thorne", version: 3, date: "Oct 10, 2023" },
  { id: "d4", title: "Client ID Verification.png", category: "Compliance", linkedTo: "David Miller", uploadedBy: "James Wilson", version: 1, date: "Oct 08, 2023" },
];

export interface DocumentVersion {
  version: number;
  date: string;
  uploader: string;
  note: string;
  current: boolean;
}

export const MOCK_DOCUMENT_VERSIONS: DocumentVersion[] = [
  { version: 3, date: "Oct 12, 2023, 2:45 PM", uploader: "Michael Scott", note: "Updated indemnity clauses per legal review.", current: true },
  { version: 2, date: "Oct 10, 2023, 11:20 AM", uploader: "James Wilson", note: "Added signature blocks for secondary tenant.", current: false },
  { version: 1, date: "Oct 05, 2023, 9:00 AM", uploader: "James Wilson", note: "Initial draft upload.", current: false },
];

// ── Workflow ────────────────────────────────────────────────
export const MOCK_WORKFLOW = {
  id: "WF-72810",
  title: "Lease Approval - Alpha Towers",
  createdAt: "Oct 14, 2023",
  stages: ["Submitted", "Manager Review", "Finance Review", "Approved"],
  currentStageIndex: 2, // Finance Review, in progress
  auditTrail: [
    { fromStage: "Submitted", toStage: "Manager Review", actor: "Sarah Jenkins", comment: "Initial documents uploaded for commercial lease #A-774.", date: "Oct 14, 2023 - 09:15 AM" },
    { fromStage: "Manager Review", toStage: "Finance Review", actor: "Marcus Chen", comment: "Terms reviewed. Forwarding to finance for final yield analysis.", date: "Oct 15, 2023 - 14:30 PM" },
  ],
  comments: [
    { author: "Sarah Jenkins", timeAgo: "2 days ago", text: "Hey Marcus, I noticed the tenant requested a different base year for OPEX." },
    { author: "Marcus Chen", timeAgo: "Yesterday", text: "Thanks Sarah. It pushes our margins a bit close." },
  ],
};

// ── Users ───────────────────────────────────────────────────
export type Role = "Admin" | "Manager" | "Staff";
export type UserStatus = "Active" | "Deactivated";

export interface OpsUser {
  id: string;
  name: string;
  department: string;
  role: Role;
  status: UserStatus;
}

export const MOCK_USERS: OpsUser[] = [
  { id: "u1", name: "Eleanor Vance", department: "Operations", role: "Admin", status: "Active" },
  { id: "u2", name: "Marcus Sterling", department: "Client Relations", role: "Manager", status: "Active" },
  { id: "u3", name: "Sarah Jenkins", department: "Legal", role: "Staff", status: "Deactivated" },
  { id: "u4", name: "David Chen", department: "Finance", role: "Manager", status: "Active" },
];

export const PERMISSION_MATRIX: Record<string, Record<Role, string>> = {
  Properties: { Admin: "✓", Manager: "Edit only", Staff: "View only" },
  Documents: { Admin: "✓", Manager: "✓", Staff: "View only" },
  Clients: { Admin: "✓", Manager: "Edit only", Staff: "None" },
  Workflows: { Admin: "✓", Manager: "View only", Staff: "None" },
};