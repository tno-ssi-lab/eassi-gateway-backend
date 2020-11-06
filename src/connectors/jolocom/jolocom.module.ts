import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JolocomSDK } from '@jolocom/sdk';
import { JolocomTypeormStorage } from '@jolocom/sdk-storage-typeorm';

import { JolocomService } from './jolocom.service';
import { JolocomWallet } from './jolocom-wallet.entity';
import { JolocomCredentialType } from './jolocom-credential-type.entity';
import { JolocomController } from './jolocom.controller';
import { JolocomCredentialRequestToken } from './jolocom-credential-request-token.entity';
import { Connection } from 'typeorm';

const jolocomSDKFactory = {
  provide: JolocomSDK,
  useFactory: (connection: Connection) => {
    return new JolocomSDK({
      storage: new JolocomTypeormStorage(connection),
    });
  },
  inject: [Connection],
};

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JolocomWallet,
      JolocomCredentialType,
      JolocomCredentialRequestToken,
    ]),
  ],
  providers: [JolocomService, jolocomSDKFactory],
  exports: [JolocomService, TypeOrmModule],
  controllers: [JolocomController],
})
export class JolocomModule {}
