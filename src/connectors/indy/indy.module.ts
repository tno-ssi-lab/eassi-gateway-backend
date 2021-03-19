import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IndyService } from './indy.service';
import { IndyController } from './indy.controller';
import { IndySchema } from './indy-schema.entity';
import { IndyInvitation } from './indy-invitation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IndySchema, IndyInvitation]), HttpModule],
  providers: [IndyService],
  controllers: [IndyController],
  exports: [IndyService, TypeOrmModule],
})
export class IndyModule {}
