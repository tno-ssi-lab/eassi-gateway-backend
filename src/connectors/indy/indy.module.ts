import { HttpModule, Module } from '@nestjs/common';
import { IndyService } from './indy.service';
import { IndyController } from './indy.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndySchema } from './indy-schema.entity';
import { IndyInvitation } from './indy-invitation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IndySchema, IndyInvitation]), HttpModule],
  providers: [IndyService],
  exports: [IndyService, TypeOrmModule],
  controllers: [IndyController],
})
export class IndyModule {}
