import { Test } from "@nestjs/testing";
import { ForbiddenException, ExecutionContext } from "@nestjs/common";
import { RolesGuard } from "./roles.guard";
import { Reflector } from "@nestjs/core";

describe("RolesGuard (SRS 6 — server-side permission enforcement)", () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  function mockContext(role: string): ExecutionContext {
    return {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({ getRequest: () => ({ user: { role } }) }),
    } as any;
  }

  it("allows access when the route has no @Roles() restriction", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(undefined);
    expect(guard.canActivate(mockContext("STAFF"))).toBe(true);
  });

  it("allows access when the user's role is in the required list", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["ADMIN", "MANAGER"]);
    expect(guard.canActivate(mockContext("MANAGER"))).toBe(true);
  });

  it("throws FORBIDDEN_ROLE (403) when the user's role is not in the required list", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["ADMIN"]);
    expect(() => guard.canActivate(mockContext("STAFF"))).toThrow(ForbiddenException);
  });

  it("includes the required role names in the thrown error message", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["ADMIN", "EXECUTIVE"]);
    try {
      guard.canActivate(mockContext("MANAGER"));
      fail("Expected canActivate to throw");
    } catch (err: any) {
      expect(err.getResponse().code).toBe("FORBIDDEN_ROLE");
      expect(err.getResponse().message).toContain("ADMIN");
    }
  });
});