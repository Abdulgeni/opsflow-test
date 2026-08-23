import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async signIn(email: string, password: string, ipAddress: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    const fail = async () => {
      if (user) {
        await this.prisma.loginActivity.create({
          data: { userId: user.id, success: false, ipAddress },
        });
      }
      throw new UnauthorizedException("Invalid email or password");
    };

    if (!user || !user.passwordHash) return fail();
    if (user.status !== "ACTIVE") return fail();

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return fail();

    await this.prisma.loginActivity.create({
      data: { userId: user.id, success: true, ipAddress },
    });

    const token = this.jwtService.sign({
      sub: user.id,
      role: user.role,
      email: user.email,
    });

    return {
      accessToken: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}