import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

export const ROLES_KEY = "roles";
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// Client-portal accounts are denied everywhere unless a route opts in with @AllowClient().
export const ALLOW_CLIENT_KEY = "allowClient";
export const AllowClient = () => SetMetadata(ALLOW_CLIENT_KEY, true);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];
    const requiredRoles = this.reflector.getAllAndOverride<string[] | undefined>(ROLES_KEY, targets);
    const user = context.switchToHttp().getRequest().user;

    if (requiredRoles && requiredRoles.length > 0) {
      if (!user || !requiredRoles.includes(user.role)) {
        throw new ForbiddenException({
          statusCode: 403,
          code: "FORBIDDEN_ROLE",
          message: `This action requires one of the following roles: ${requiredRoles.join(", ")}`,
        });
      }
      return true;
    }

    // No explicit roles: staff pass. A client passes only where the route opts in.
    if (user?.role === "CLIENT") {
      const allowed = this.reflector.getAllAndOverride<boolean | undefined>(ALLOW_CLIENT_KEY, targets);
      if (!allowed) {
        throw new ForbiddenException({
          statusCode: 403,
          code: "FORBIDDEN_ROLE",
          message: "This action is not available to client accounts",
        });
      }
    }
    return true;
  }
}
