import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WaltidService } from './waltid.service';
import { WaltidSchema } from './waltid-schema.entity';
import { WaltidController } from './waltid.controller';
import { WaltidInvitation } from './waltid-invitation.entity';


@Module({
  imports: [TypeOrmModule.forFeature([WaltidSchema, WaltidInvitation]), HttpModule],
  providers: [WaltidService],
  controllers: [WaltidController],
  exports: [WaltidService, TypeOrmModule],
})
export class WaltidModule {}