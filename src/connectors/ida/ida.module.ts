import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IdaService } from './ida.service';
import { IdaCredentialType } from './ida-credential-type.entity';
import { IdaController } from './ida.controller';
import { IdaCredentialRequestToken } from './ida-credential-request-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IdaCredentialType,
      IdaCredentialRequestToken,
    ]),
  ],
  providers: [IdaService],
  exports: [IdaService],
  controllers: [IdaController],
})
export class IdaModule {}
