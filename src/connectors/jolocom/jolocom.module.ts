import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JolocomService } from './jolocom.service';
import { JolocomWallet } from './jolocom-wallet.entity';
import { JolocomCredentialType } from './jolocom-credential-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JolocomWallet, JolocomCredentialType])],
  providers: [JolocomService],
  exports: [JolocomService],
})
export class JolocomModule {}
