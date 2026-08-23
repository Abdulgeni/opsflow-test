import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { DocumentsService } from "./documents.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles, RolesGuard } from "../auth/roles.guard";

@Controller("documents")
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Get()
  findAll(
    @Query("category") category?: string,
    @Query("linkedTo") linkedTo?: string,
    @Query("search") search?: string
  ) {
    return this.documentsService.findAll({ category, linkedTo, search });
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.documentsService.findOne(id);
  }

  @Post()
  @Roles("ADMIN", "MANAGER")
  create(
    @Req() req: any,
    @Body() data: { title: string; category: string; linkedTo: string }
  ) {
    return this.documentsService.create({ ...data, uploadedById: req.user.id });
  }
}