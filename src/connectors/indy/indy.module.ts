import { Module } from '@nestjs/common';
import { IndyService } from './indy.service';

@Module({
  providers: [IndyService],
  exports: [IndyService],
})
export class IndyModule {}
