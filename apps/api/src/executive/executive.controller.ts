import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { ExecutiveService } from "./executive.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles, RolesGuard } from "../auth/roles.guard";

@Controller("executive")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExecutiveController {
  constructor(private executiveService: ExecutiveService) {}

  // Reused by both Executive Summary (Admin/Executive) and Reports
  // (Admin/Manager/Staff) — no class-level @Roles() restriction on this
  // one method, since its access rule differs from the rest of this module.
  @Get("summary")
  getSummary() {
    return this.executiveService.getSummary();
  }

  @Get("flags")
  @Roles("ADMIN", "EXECUTIVE")
  getFlags() {
    return this.executiveService.getFlags();
  }

  @Get("notes")
  @Roles("ADMIN", "EXECUTIVE")
  getNotes() {
    return this.executiveService.getNotes();
  }

  @Post("notes")
  @Roles("ADMIN", "EXECUTIVE")
  addNote(@Req() req: any, @Body() data: { linkedTo: string; note: string }) {
    return this.executiveService.addNote(data.linkedTo, req.user.id, data.note);
  }
}