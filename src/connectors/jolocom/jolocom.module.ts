import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JolocomService } from './jolocom.service';
import { JolocomWallet } from './jolocom-wallet.entity';
import { JolocomCredentialType } from './jolocom-credential-type.entity';
import { JolocomController } from './jolocom.controller';
import { JolocomCredentialRequestToken } from './jolocom-credential-request-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JolocomWallet,
      JolocomCredentialType,
      JolocomCredentialRequestToken,
    ]),
  ],
  providers: [JolocomService],
  exports: [JolocomService, TypeOrmModule],
  controllers: [JolocomController],
})
export class JolocomModule {}
