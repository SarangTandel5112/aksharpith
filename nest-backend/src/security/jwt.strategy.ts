import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { AuthKeyConfig, AuthKeyConfigName } from 'src/config/authkey.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<AuthKeyConfig>(AuthKeyConfigName).jwtSecret,
    });
  }

  async validate(payload: any): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: payload.id },
        relations: ['role'],
      });

      if (!user) throw new UnauthorizedException('UNAUTHORIZED');

      return user;
    } catch (error) {
      throw new UnauthorizedException('UNAUTHORIZED');
    }
  }
}
