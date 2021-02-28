import { Module } from '@nestjs/common';
import { IdaService } from './ida.service';
import { IdaController } from './ida.controller';

@Module({
  providers: [IdaService],
  exports: [IdaService],
  controllers: [IdaController],
})
export class IdaModule {}
