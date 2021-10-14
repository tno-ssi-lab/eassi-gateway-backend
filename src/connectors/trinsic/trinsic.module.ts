import { HttpModule, Module } from '@nestjs/common';
import { Connection } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrinsicService } from './trinsic.service';
import { TrinsicSchema } from './trinsic-schema.entity';
import { TrinsicController } from './trinsic.controller';
import { TrinsicInvitation } from './trinsic-invitation.entity';
import { ConfigService } from 'src/config/config.service';


@Module({
  imports: [TypeOrmModule.forFeature([TrinsicSchema, TrinsicInvitation]), HttpModule],
  providers: [TrinsicService],
  controllers: [TrinsicController],
  exports: [TrinsicService, TypeOrmModule],
})
export class TrinsicModule {}
