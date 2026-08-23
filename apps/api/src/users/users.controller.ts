import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles, RolesGuard } from "../auth/roles.guard";
import { Public } from "../auth/public.decorator";

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles("ADMIN")
  findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  @Roles("ADMIN", "MANAGER")
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles("ADMIN")
  create(@Body() dto: any) {
    return this.usersService.create(dto);
  }

  @Patch(":id/role")
  @Roles("ADMIN")
  updateRole(@Param("id") id: string, @Body("role") role: any) {
    return this.usersService.updateRole(id, role);
  }

  @Patch(":id/status")
  @Roles("ADMIN")
  updateStatus(@Param("id") id: string, @Body("status") status: any) {
    return this.usersService.updateStatus(id, status);
  }

  @Patch("me")
  updateOwnProfile(@Req() req: any, @Body() data: any) {
    return this.usersService.updateOwnProfile(req.user.id, data);
  }

  @Get(":id/login-activity")
  @Roles("ADMIN")
  getLoginActivity(@Param("id") id: string) {
    return this.usersService.getLoginActivity(id);
  }

  @Public()
  @Post("activate")
  activateAccount(@Body("token") token: string, @Body("password") password: string) {
    return this.usersService.activateAccount(token, password);
  }
}