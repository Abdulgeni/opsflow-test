import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { PropertiesModule } from "./properties/properties.module";
import { ClientsModule } from "./clients/clients.module";
import { DocumentsModule } from "./documents/documents.module";
import { WorkflowsModule } from "./workflows/workflows.module";
import { ExecutiveModule } from "./executive/executive.module";
import { ReportsModule } from "./reports/reports.module";
import { NotificationsModule } from "./notifications/notifications.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    PropertiesModule,
    ClientsModule,
    DocumentsModule,
    WorkflowsModule,
    ExecutiveModule,
    ReportsModule,
    NotificationsModule,
  ],
})
export class AppModule {}