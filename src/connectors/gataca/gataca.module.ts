import { Module } from '@nestjs/common';
import { GatacaService } from './gataca.service';

@Module({
  providers: [GatacaService],
  exports: [GatacaService],
})
export class GatacaModule {}
