import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { PushService } from "./push.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles, RolesGuard } from "../auth/roles.guard";

const STAFF_ROLES = ["ADMIN", "MANAGER", "STAFF", "EXECUTIVE"];

@Controller("notifications")
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService, private push: PushService) {}

  @Get()
  findMine(@Req() req: any) { return this.notificationsService.findForUser(req.user.id); }

  @Patch(":id/read")
  markAsRead(@Param("id") id: string, @Req() req: any) { return this.notificationsService.markAsRead(id, req.user.id); }

  @Post("push-token")
  @Roles(...STAFF_ROLES)
  registerPushToken(@Req() req: any, @Body() body: { token: string; platform?: string }) {
    return this.push.register(req.user.id, body?.token, body?.platform);
  }

  @Post("push-token/remove")
  @Roles(...STAFF_ROLES)
  removePushToken(@Req() req: any, @Body() body: { token: string }) {
    return this.push.unregister(req.user.id, body?.token);
  }

  @Post("push-test")
  @Roles(...STAFF_ROLES)
  async pushTest(@Req() req: any) {
    await this.notificationsService.create(req.user.id, "Test notification from OpsFlow. Push is working.");
    return { success: true };
  }
}
