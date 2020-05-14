import { Module } from '@nestjs/common';
import { IrmaService } from './irma.service';

@Module({
  providers: [IrmaService],
  exports: [IrmaService],
})
export class IrmaModule {}
