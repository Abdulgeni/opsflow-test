import "dotenv/config";
import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "../email/email.service";

describe("UsersService", () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        PrismaService,
        { provide: EmailService, useValue: { sendActivationEmail: jest.fn(), sendPasswordResetEmail: jest.fn() } },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  let createdId: string;
  const testEmail = `jest-test-${Date.now()}@example.com`;

  it("creates a user with PENDING status (CREATE)", async () => {
    const result = await service.create({
      name: "Jest Test User",
      email: testEmail,
      role: "STAFF",
    });

    expect(result.user).toBeDefined();
    expect(result.user.status).toBe("PENDING");
    expect(result.activationToken).toBeDefined();

    createdId = result.user.id;
  });

  it("reads the created user back (READ)", async () => {
    const user = await service.findOne(createdId);
    expect(user.id).toBe(createdId);
    expect(user.email).toBe(testEmail);
  });

  it("updates the user's own profile without changing role (UPDATE)", async () => {
    const updated = await service.updateOwnProfile(createdId, { name: "Updated Name" });
    expect(updated.name).toBe("Updated Name");
    expect(updated.role).toBe("STAFF"); // role must remain unchanged via this method
  });

  it("cannot activate with an invalid token", async () => {
    await expect(service.activateAccount("invalid-token-that-does-not-exist", "password123")).rejects.toThrow();
  });

  afterAll(async () => {
    // Clean up the test user
    await prisma.user.delete({ where: { id: createdId } }).catch(() => {});
  });
});