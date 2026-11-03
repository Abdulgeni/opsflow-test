import "dotenv/config";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as bcrypt from "bcrypt";
import { AppModule } from "./app.module";
import { PrismaService } from "./prisma/prisma.service";
import { EmailService } from "./email/email.service";
import { NotificationsService } from "./notifications/notifications.service";
import { StorageService } from "./documents/storage.service";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const request: any = require("supertest");

jest.setTimeout(120_000);

const ROLES = ["ADMIN", "MANAGER", "STAFF", "EXECUTIVE", "CLIENT"] as const;
type Role = (typeof ROLES)[number];
type Caller = Role | "NONE";
type Method = "get" | "post" | "patch" | "delete";
const MISSING = "00000000-0000-0000-0000-000000000000";

const CLIENT_MUST_BE_DENIED: [Method, string][] = [
  ["get", "/properties"], ["get", `/properties/${MISSING}`],
  ["get", "/clients"], ["get", `/clients/${MISSING}`],
  ["get", "/documents"], ["get", `/documents/${MISSING}`],
  ["get", "/workflows"], ["get", "/leases"], ["get", "/users"], ["get", "/notifications"],
  ["get", "/executive/summary"], ["get", "/executive/flags"], ["get", "/reports/history"],
  ["post", "/reports/history/capture-now"],
  ["post", `/properties/${MISSING}/maintenance`],
  ["post", `/clients/${MISSING}/contact-log`],
  ["post", `/documents/${MISSING}/upload-url`],
  ["post", `/workflows/${MISSING}/comments`],
  ["post", "/notifications/push-test"],
];

const BOUNDARIES: [Role, Method, string, number][] = [
  ["STAFF", "get", "/properties", 200],
  ["EXECUTIVE", "get", "/properties", 200],
  ["STAFF", "post", "/properties", 403],
  ["EXECUTIVE", "post", "/properties", 403],
  ["STAFF", "delete", `/properties/${MISSING}`, 403],
  ["MANAGER", "delete", `/properties/${MISSING}`, 403],
  ["MANAGER", "patch", `/properties/${MISSING}/unarchive`, 403],
  ["STAFF", "get", "/executive/summary", 200],
  ["STAFF", "get", "/executive/flags", 403],
  ["MANAGER", "get", "/executive/flags", 403],
  ["EXECUTIVE", "get", "/executive/flags", 200],
  ["ADMIN", "get", "/executive/flags", 200],
  ["STAFF", "get", "/leases", 200],
  ["EXECUTIVE", "get", "/leases", 403],
  ["STAFF", "post", "/leases", 403],
  ["STAFF", "get", "/leases/mine", 403],
  ["STAFF", "get", "/workflows", 200],
  ["EXECUTIVE", "get", "/workflows", 200],
  ["STAFF", "post", "/workflows", 403],
  ["MANAGER", "post", "/workflows", 400],
  ["STAFF", "post", "/users", 403],
  ["MANAGER", "post", "/users", 403],
];

describe("Authorization over HTTP (every role, real guards, real database)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const stamp = Date.now();
  const PASSWORD = "Authz-Test-1234";
  const tokens: Partial<Record<Role, string>> = {};
  const created = {
    users: [] as string[], clients: [] as string[], properties: [] as string[],
    documents: [] as string[], workflows: [] as string[],
  };
  let ownLeaseId = "";
  let otherLeaseId = "";
  let ownDocId = "";
  let otherDocId = "";

  const call = (who: Caller, method: Method, path: string, body: object = {}) => {
    const req = request(app.getHttpServer())[method](path);
    if (who !== "NONE") req.set("Authorization", `Bearer ${tokens[who]}`);
    return method === "get" || method === "delete" ? req : req.send(body);
  };

  const safe = async (fn: () => Promise<unknown>) => {
    try { await fn(); } catch { /* cleanup best-effort */ }
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(EmailService)
      .useValue({ sendActivationEmail: jest.fn(), sendPasswordResetEmail: jest.fn() })
      .overrideProvider(StorageService)
      .useValue({
        getUploadUrl: async () => "https://storage.test/upload",
        getDownloadUrl: async () => "https://storage.test/download",
      })
      .overrideProvider(NotificationsService)
      .useValue({
        create: jest.fn(async () => ({})),
        findForUser: jest.fn(), unreadCount: jest.fn(), markAsRead: jest.fn(), markAllAsRead: jest.fn(),
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService, { strict: false });

    const mine = await prisma.client.create({
      data: { name: `Authz Client ${stamp}`, type: "INDIVIDUAL", email: `authz-client-${stamp}@example.test`, status: "ACTIVE" },
    });
    const theirs = await prisma.client.create({
      data: { name: `Authz Other ${stamp}`, type: "INDIVIDUAL", email: `authz-other-${stamp}@example.test`, status: "ACTIVE" },
    });
    created.clients.push(mine.id, theirs.id);

    const property = await prisma.property.create({
      data: { name: `Authz Property ${stamp}`, address: "1 Test St", type: "Residential", status: "AVAILABLE" },
    });
    created.properties.push(property.id);

    const leaseData = { propertyId: property.id, startDate: new Date(), endDate: new Date(Date.now() + 30 * 86_400_000), rentAmount: 100, status: "ACTIVE" as const };
    ownLeaseId = (await prisma.lease.create({ data: { ...leaseData, clientId: mine.id } })).id;
    otherLeaseId = (await prisma.lease.create({ data: { ...leaseData, clientId: theirs.id } })).id;

    const passwordHash = await bcrypt.hash(PASSWORD, 4);
    let adminId = "";
    for (const role of ROLES) {
      const user = await prisma.user.create({
        data: {
          name: `Authz ${role}`,
          email: `authz-${role.toLowerCase()}-${stamp}@example.test`,
          role: role as any,
          status: "ACTIVE",
          passwordHash,
          ...(role === "CLIENT" ? { clientId: mine.id } : {}),
        },
      });
      created.users.push(user.id);
      if (role === "ADMIN") adminId = user.id;

      const res = await request(app.getHttpServer())
        .post("/auth/sign-in")
        .send({ email: user.email, password: PASSWORD });
      if (!res.body?.accessToken) {
        throw new Error(`Could not sign in as ${role}: HTTP ${res.status} ${JSON.stringify(res.body)}`);
      }
      tokens[role] = res.body.accessToken;
    }

    const docBase = { category: "Legal", linkedEntityType: "Client", uploadedById: adminId, version: 1 };
    ownDocId = (await prisma.document.create({ data: { ...docBase, title: "Authz own", linkedEntityId: mine.id } })).id;
    otherDocId = (await prisma.document.create({ data: { ...docBase, title: "Authz other", linkedEntityId: theirs.id } })).id;
    created.documents.push(ownDocId, otherDocId);
  });

  afterAll(async () => {
    try {
      await safe(() => prisma.workflowComment.deleteMany({ where: { workflowInstanceId: { in: created.workflows } } }));
      await safe(() => prisma.workflowTransition.deleteMany({ where: { workflowInstanceId: { in: created.workflows } } }));
      await safe(() => prisma.workflowInstance.deleteMany({ where: { id: { in: created.workflows } } }));
      await safe(() => prisma.documentVersion.deleteMany({ where: { documentId: { in: created.documents } } }));
      await safe(() => prisma.document.deleteMany({ where: { id: { in: created.documents } } }));
      await safe(() => prisma.lease.deleteMany({ where: { clientId: { in: created.clients } } }));
      await safe(() => prisma.user.deleteMany({ where: { id: { in: created.users } } }));
      await safe(() => prisma.client.deleteMany({ where: { id: { in: created.clients } } }));
      await safe(() => prisma.property.deleteMany({ where: { id: { in: created.properties } } }));
    } finally {
      await app?.close();
    }
  });

  describe("unauthenticated callers", () => {
    it("GET /health is public and reports up", async () => {
      const res = await call("NONE", "get", "/health");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: "ok" });
    });

    it.each([
      ["get", "/properties"],
      ["get", "/leases/mine"],
      ["get", "/executive/summary"],
    ] as [Method, string][])("%s %s is refused with 401", async (method, path) => {
      expect((await call("NONE", method, path)).status).toBe(401);
    });
  });

  describe("client-portal accounts are denied by default", () => {
    it.each(CLIENT_MUST_BE_DENIED)("a client cannot %s %s", async (method, path) => {
      const res = await call("CLIENT", method, path);
      expect(res.status).toBe(403);
    });
  });

  describe("what a client may do, and only for their own records", () => {
    it("sees exactly their own lease and document through the portal routes", async () => {
      const leases = await call("CLIENT", "get", "/leases/mine");
      expect(leases.status).toBe(200);
      expect(leases.body.map((l: { id: string }) => l.id)).toEqual([ownLeaseId]);

      const docs = await call("CLIENT", "get", "/documents/mine");
      expect(docs.status).toBe(200);
      expect(docs.body.map((d: { id: string }) => d.id)).toEqual([ownDocId]);
    });

    it("can open their own lease but not another client's", async () => {
      expect((await call("CLIENT", "get", `/leases/${ownLeaseId}`)).status).toBe(200);
      const other = await call("CLIENT", "get", `/leases/${otherLeaseId}`);
      expect(other.status).toBe(403);
    });

    it("can download their own document but not another client's", async () => {
      const own = await call("CLIENT", "get", `/documents/mine/${ownDocId}/download-url`);
      expect(own.status).toBe(200);
      expect(own.body.downloadUrl).toBe("https://storage.test/download");

      const other = await call("CLIENT", "get", `/documents/mine/${otherDocId}/download-url`);
      expect(other.status).toBe(403);
      expect(other.body.code).toBe("FORBIDDEN_NOT_LINKED");
    });

    it("cannot change password (client-portal accounts have no password-change UI)", async () => {
      const res = await call("CLIENT", "patch", "/users/me/password", {
        currentPassword: "definitely-wrong",
        newPassword: "another-long-password",
      });
      expect(res.status).toBe(403);
    });
  });

  describe("staff role boundaries", () => {
    it.each(BOUNDARIES)("%s %s %s -> %i", async (role, method, path, expected) => {
      const res = await call(role, method, path);
      expect(res.status).toBe(expected);
    });
  });

  describe("workflow authority end to end", () => {
    it("enforces per-stage roles, closes on reject, and lets only an Admin reopen", async () => {
      const made = await call("ADMIN", "post", "/workflows", {
        title: `Authz workflow ${stamp}`,
        stages: [
          { name: "A", role: "MANAGER" },
          { name: "B", role: "MANAGER" },
          { name: "C", role: "ADMIN" },
        ],
      });
      expect(made.status).toBe(201);
      const id = made.body.id as string;
      created.workflows.push(id);

      const staffTry = await call("STAFF", "post", `/workflows/${id}/advance`);
      expect(staffTry.status).toBe(403);
      expect(staffTry.body.code).toBe("FORBIDDEN_STAGE_ROLE");

      expect((await call("MANAGER", "post", `/workflows/${id}/advance`)).status).toBe(201);
      expect((await call("MANAGER", "post", `/workflows/${id}/reject`, { comment: "no budget" })).status).toBe(201);

      const closed = await call("MANAGER", "post", `/workflows/${id}/advance`);
      expect(closed.status).toBe(400);
      expect(closed.body.code).toBe("INVALID_TRANSITION");

      expect((await call("MANAGER", "post", `/workflows/${id}/reopen`, { comment: "please" })).status).toBe(403);
      const noReason = await call("ADMIN", "post", `/workflows/${id}/reopen`, { comment: "" });
      expect(noReason.status).toBe(400);
      expect((await call("ADMIN", "post", `/workflows/${id}/reopen`, { comment: "budget found" })).status).toBe(201);

      expect((await call("MANAGER", "post", `/workflows/${id}/advance`)).status).toBe(201);
      const detail = await call("MANAGER", "get", `/workflows/${id}`);
      expect(detail.status).toBe(200);
      expect(detail.body.rejected).toBe(false);
    });
  });
});
