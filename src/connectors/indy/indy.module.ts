import { Module } from '@nestjs/common';
import { IndyService } from './indy.service';
import { IndyController } from './indy.controller';

@Module({
  providers: [IndyService],
  exports: [IndyService],
  controllers: [IndyController],
})
export class IndyModule {}
