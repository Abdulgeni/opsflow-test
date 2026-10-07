import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { DocumentsService } from "./documents.service";
import { StorageService } from "./storage.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles, RolesGuard } from "../auth/roles.guard";

const INTERNAL_ROLES = ["ADMIN", "MANAGER", "STAFF", "EXECUTIVE"];

@Controller("documents")
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(
    private documentsService: DocumentsService,
    private storageService: StorageService
  ) {}

  // ─── Portal routes (CLIENT only) ───────────────────────────────
  // Declared before the ":id" routes so the literal "mine" wins.

  @Get("mine")
  @Roles("CLIENT")
  findMine(@Req() req: any) {
    if (!req.user.clientId) return [];
    return this.documentsService.findForPortalUser(req.user.clientId);
  }

  @Get("mine/:id/download-url")
  @Roles("CLIENT")
  async getMineDownloadUrl(@Param("id") id: string, @Req() req: any) {
    await this.documentsService.assertPortalAccess(id, req.user.clientId);
    const key = `documents/${id}`;
    const url = await this.storageService.getDownloadUrl(key);
    return { downloadUrl: url };
  }

  // ─── Internal routes (staff only) ──────────────────────────────

  @Get()
  @Roles(...INTERNAL_ROLES)
  findAll(
    @Query("category") category?: string,
    @Query("linkedEntityId") linkedEntityId?: string,
    @Query("search") search?: string
  ) {
    return this.documentsService.findAll({ category, linkedEntityId, search });
  }

  @Get(":id")
  @Roles(...INTERNAL_ROLES)
  findOne(@Param("id") id: string) {
    return this.documentsService.findOne(id);
  }

  @Post()
  @Roles("ADMIN", "MANAGER")
  create(
    @Req() req: any,
    @Body() data: { title: string; category: string; linkedEntityType: string; linkedEntityId: string }
  ) {
    return this.documentsService.create({ ...data, uploadedById: req.user.id });
  }

  @Patch(":id")
  @Roles("ADMIN", "MANAGER")
  update(@Param("id") id: string, @Body() data: { title?: string; category?: string }) {
    return this.documentsService.update(id, data);
  }

  @Post(":id/upload-url")
  @Roles(...INTERNAL_ROLES)
  async getUploadUrl(@Param("id") id: string, @Body("contentType") contentType: string) {
    const key = `documents/${id}`;
    const url = await this.storageService.getUploadUrl(key, contentType);
    return { uploadUrl: url, key };
  }

  @Get(":id/download-url")
  @Roles(...INTERNAL_ROLES)
  async getDownloadUrl(@Param("id") id: string) {
    const key = `documents/${id}`;
    const url = await this.storageService.getDownloadUrl(key);
    return { downloadUrl: url };
  }
}