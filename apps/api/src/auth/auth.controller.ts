import { Body, Controller, Ip, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Public } from "./public.decorator";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post("sign-in")
  signIn(
    @Body("email") email: string,
    @Body("password") password: string,
    @Ip() ip: string
  ) {
    return this.authService.signIn(email, password, ip);
  }
}