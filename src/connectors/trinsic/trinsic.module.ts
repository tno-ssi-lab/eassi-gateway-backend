import { Module } from '@nestjs/common';
import { TrinsicService } from './trinsic.service';
import { TrinsicController } from './trinsic.controller';

@Module({
  providers: [TrinsicService],
  exports: [TrinsicService],
  controllers: [TrinsicController],
})
export class TrinsicModule {}
