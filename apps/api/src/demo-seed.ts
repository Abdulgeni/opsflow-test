import "dotenv/config";
import * as bcrypt from "bcrypt";
import { PrismaClient } from "./generated/prisma/client";

const prisma = new PrismaClient();

const DEMO_DOMAIN = "@demo.opsflow.test";
const TAG = "[Demo] ";
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const daysAhead = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

type Stage = { name: string; role: string };
const LEASE_STAGES: Stage[] = [
  { name: "Submitted", role: "STAFF" },
  { name: "Manager Review", role: "MANAGER" },
  { name: "Finance Review", role: "MANAGER" },
  { name: "Approved", role: "ADMIN" },
];
const SHORT_STAGES: Stage[] = [
  { name: "Submitted", role: "STAFF" },
  { name: "Manager Review", role: "MANAGER" },
  { name: "Approved", role: "ADMIN" },
];

function describeTarget() {
  try {
    const url = new URL(process.env.DATABASE_URL ?? "");
    return `${url.hostname}:${url.port || "5432"}${url.pathname}`;
  } catch { return "(DATABASE_URL is missing or invalid)"; }
}

async function removeDemoContent() {
  const users = await prisma.user.findMany({ where: { email: { endsWith: DEMO_DOMAIN } }, select: { id: true } });
  const userIds = users.map((u: { id: string }) => u.id);
  const clients = await prisma.client.findMany({ where: { name: { startsWith: TAG } }, select: { id: true } });
  const clientIds = clients.map((c: { id: string }) => c.id);
  const properties = await prisma.property.findMany({ where: { name: { startsWith: TAG } }, select: { id: true } });
  const propertyIds = properties.map((p: { id: string }) => p.id);
  const workflows = await prisma.workflowInstance.findMany({ where: { title: { startsWith: TAG } }, select: { id: true } });
  const workflowIds = workflows.map((w: { id: string }) => w.id);

  const docs = await prisma.document.findMany({ where: { linkedEntityId: { in: [...clientIds, ...propertyIds] } }, select: { id: true } });
  const docIds = docs.map((d: { id: string }) => d.id);
  await prisma.documentVersion.deleteMany({ where: { documentId: { in: docIds } } });
  await prisma.document.deleteMany({ where: { id: { in: docIds } } });

  await prisma.workflowComment.deleteMany({ where: { workflowInstanceId: { in: workflowIds } } });
  await prisma.workflowTransition.deleteMany({ where: { workflowInstanceId: { in: workflowIds } } });
  await prisma.workflowInstance.deleteMany({ where: { id: { in: workflowIds } } });

  await prisma.notification.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.pushToken.deleteMany({ where: { userId: { in: userIds } } });

  await prisma.lease.deleteMany({ where: { OR: [{ clientId: { in: clientIds } }, { propertyId: { in: propertyIds } }] } });
  await prisma.occupancyRecord.deleteMany({ where: { OR: [{ clientId: { in: clientIds } }, { propertyId: { in: propertyIds } }] } });
  await prisma.maintenanceRequest.deleteMany({ where: { propertyId: { in: propertyIds } } });

  await prisma.user.updateMany({ where: { id: { in: userIds } }, data: { clientId: null } });
  const contactLog = (prisma as any).contactLog;
  if (contactLog) await contactLog.deleteMany({ where: { clientId: { in: clientIds } } });
  await prisma.client.deleteMany({ where: { id: { in: clientIds } } });
  await prisma.property.deleteMany({ where: { id: { in: propertyIds } } });
}

async function removeDemoUsers() {
  const users = await prisma.user.findMany({ where: { email: { endsWith: DEMO_DOMAIN } }, select: { id: true } });
  let deactivated = 0;
  for (const u of users) {
    try { await prisma.user.delete({ where: { id: u.id } }); }
    catch { await prisma.user.update({ where: { id: u.id }, data: { status: "DEACTIVATED" } }); deactivated++; }
  }
  if (deactivated > 0) console.log(`${deactivated} demo account(s) had history and were deactivated.`);
}

async function createWorkflow(args: {
  title: string; stages: Stage[]; currentStageIndex: number;
  link: { type: "Property" | "Client"; id: string }; createdDaysAgo: number;
  trail: { from: string; to: string; actorId: string; daysAgo: number; comment?: string }[];
  comments?: { authorId: string; body: string; daysAgo: number }[];
}) {
  const wf = await prisma.workflowInstance.create({
    data: {
      title: TAG + args.title, stages: args.stages, currentStageIndex: args.currentStageIndex,
      linkedEntityType: args.link.type, linkedEntityId: args.link.id, createdAt: daysAgo(args.createdDaysAgo),
    },
  });
  for (const t of args.trail) {
    await prisma.workflowTransition.create({ data: { workflowInstanceId: wf.id, fromStage: t.from, toStage: t.to, actorId: t.actorId, comment: t.comment, createdAt: daysAgo(t.daysAgo) } });
  }
  for (const c of args.comments ?? []) {
    await prisma.workflowComment.create({ data: { workflowInstanceId: wf.id, authorId: c.authorId, body: c.body, createdAt: daysAgo(c.daysAgo) } });
  }
  return wf;
}

async function seed() {
  const password = process.env.DEMO_PASSWORD;
  if (!password || password.length < 8) throw new Error("Set DEMO_PASSWORD (8+ chars)");
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN", status: "ACTIVE" }, orderBy: { createdAt: "asc" } });
  if (!admin) throw new Error("No active ADMIN user found. Run the main seed first.");

  await removeDemoContent();
  const passwordHash = await bcrypt.hash(password, 10);

  const sarah = await prisma.client.create({ data: { name: TAG + "Sarah Chen", type: "INDIVIDUAL", email: `sarah.chen${DEMO_DOMAIN}`, phone: "+251911000001", status: "ACTIVE", relationshipType: "TENANT" } });
  const horizon = await prisma.client.create({ data: { name: TAG + "Horizon Retail PLC", type: "ORGANIZATION", email: `contact.horizon${DEMO_DOMAIN}`, phone: "+251911000002", status: "ACTIVE", relationshipType: "TENANT" } });
  const meskel = await prisma.client.create({ data: { name: TAG + "Meskel Investments", type: "ORGANIZATION", email: `info.meskel${DEMO_DOMAIN}`, status: "LEAD", relationshipType: "OWNER" } });

  const alpha = await prisma.property.create({ data: { name: TAG + "Alpha Towers", address: "Bole Subcity, Addis Ababa", type: "Commercial", status: "OCCUPIED" } });
  const riverside = await prisma.property.create({ data: { name: TAG + "Riverside Apartments", address: "Kazanchis, Addis Ababa", type: "Residential", status: "OCCUPIED" } });
  await prisma.property.create({ data: { name: TAG + "Bole Business Park", address: "CMC Road, Addis Ababa", type: "Commercial", status: "AVAILABLE" } });
  const warehouse = await prisma.property.create({ data: { name: TAG + "Old Warehouse 7", address: "Akaki Kaliti Industrial Zone, Addis Ababa", type: "Industrial", status: "UNDER_MAINTENANCE", statusBeforeMaintenance: "AVAILABLE", updatedAt: daysAgo(14) } });
  await prisma.maintenanceRequest.create({ data: { propertyId: warehouse.id, description: "Roof leak above the loading bay", status: "OPEN", createdAt: daysAgo(14) } });

  await prisma.lease.create({ data: { propertyId: riverside.id, clientId: sarah.id, startDate: daysAgo(200), endDate: daysAhead(165), rentAmount: 1200, status: "ACTIVE" } });
  await prisma.lease.create({ data: { propertyId: alpha.id, clientId: horizon.id, startDate: daysAgo(90), endDate: daysAhead(275), rentAmount: 8500, status: "ACTIVE" } });
  await prisma.occupancyRecord.create({ data: { propertyId: riverside.id, clientId: sarah.id, startDate: daysAgo(200) } });
  await prisma.occupancyRecord.create({ data: { propertyId: alpha.id, clientId: horizon.id, startDate: daysAgo(90) } });

  async function upsertUser(key: string, name: string, role: string, extra: Record<string, unknown> = {}) {
    const email = `${key}${DEMO_DOMAIN}`;
    return prisma.user.upsert({ where: { email }, update: { name, role: role as any, status: "ACTIVE", passwordHash, ...extra }, create: { name, email, role: role as any, status: "ACTIVE", passwordHash, ...extra } });
  }
  const manager = await upsertUser("demo.manager", "Demo Manager", "MANAGER");
  const staff = await upsertUser("demo.staff", "Demo Staff", "STAFF");
  await upsertUser("demo.executive", "Demo Executive", "EXECUTIVE");
  await upsertUser("demo.client", "Demo Client (Sarah Chen)", "CLIENT", { clientId: sarah.id });

  await createWorkflow({ title: "Lease Approval - Alpha Towers", stages: LEASE_STAGES, currentStageIndex: 0, link: { type: "Property", id: alpha.id }, createdDaysAgo: 0, trail: [] });
  const stalled = await createWorkflow({
    title: "Maintenance Approval - Old Warehouse 7", stages: SHORT_STAGES, currentStageIndex: 1,
    link: { type: "Property", id: warehouse.id }, createdDaysAgo: 14,
    trail: [{ from: "Submitted", to: "Manager Review", actorId: staff.id, daysAgo: 12, comment: "Roof leak reported by the tenant" }],
    comments: [
      { authorId: staff.id, body: "Contractor quote is attached to the property record.", daysAgo: 11 },
      { authorId: manager.id, body: "Reviewing the quote this week.", daysAgo: 9 },
    ],
  });
  await createWorkflow({
    title: "Client Onboarding - Meskel Investments", stages: SHORT_STAGES, currentStageIndex: 2,
    link: { type: "Client", id: meskel.id }, createdDaysAgo: 20,
    trail: [
      { from: "Submitted", to: "Manager Review", actorId: staff.id, daysAgo: 19 },
      { from: "Manager Review", to: "Approved", actorId: manager.id, daysAgo: 17, comment: "Documents verified" },
    ],
  });
  const rejected = await createWorkflow({
    title: "Lease Renewal - Riverside Apartments", stages: LEASE_STAGES, currentStageIndex: 1,
    link: { type: "Property", id: riverside.id }, createdDaysAgo: 6,
    trail: [
      { from: "Submitted", to: "Manager Review", actorId: staff.id, daysAgo: 5 },
      { from: "Manager Review", to: "Rejected", actorId: manager.id, daysAgo: 3, comment: "Proposed rent increase is above the agreed cap" },
    ],
  });

  await prisma.notification.create({ data: { userId: manager.id, message: `"${stalled.title}" needs your approval at "Manager Review"`, isRead: false, linkedEntityType: "workflow", linkedEntityId: stalled.id, createdAt: daysAgo(1) } });
  await prisma.notification.create({ data: { userId: staff.id, message: `"${rejected.title}" was rejected at "Manager Review": "Proposed rent increase is above the agreed cap"`, isRead: false, linkedEntityType: "workflow", linkedEntityId: rejected.id, createdAt: daysAgo(3) } });

  console.log("\nDemo data is ready. Demo accounts:");
  for (const key of ["demo.manager", "demo.staff", "demo.executive", "demo.client"]) console.log(`  ${key}${DEMO_DOMAIN}`);
  console.log("\nRemove everything afterwards with: npx ts-node src/demo-seed.ts --reset --yes\n");
}

async function main() {
  const reset = process.argv.includes("--reset");
  console.log(`Target database: ${describeTarget()}`);
  if (!process.argv.includes("--yes")) {
    console.log(`Nothing changed. Re-run with --yes to ${reset ? "REMOVE" : "create"} demo data.`);
    return;
  }
  if (reset) { await removeDemoContent(); await removeDemoUsers(); console.log("Demo data removed."); return; }
  await seed();
}

main().catch((err) => { console.error(err instanceof Error ? err.message : err); process.exitCode = 1; }).finally(() => prisma.$disconnect());
