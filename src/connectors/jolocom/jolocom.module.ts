import { Module } from '@nestjs/common';
import { JolocomService } from './jolocom.service';

@Module({
  providers: [JolocomService],
  exports: [JolocomService],
})
export class JolocomModule {}
