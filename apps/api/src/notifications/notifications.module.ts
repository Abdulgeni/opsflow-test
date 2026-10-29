import { Module } from "@nestjs/common";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";
import { NotificationsGateway } from "./notifications.gateway";
import { PushService } from "./push.service";

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway, PushService],
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}
