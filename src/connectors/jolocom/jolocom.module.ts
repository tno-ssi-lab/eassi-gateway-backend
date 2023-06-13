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
import { DidMethodKeeper } from '@jolocom/sdk/js/didMethodKeeper';
import { JoloDidMethod } from 'jolocom-lib/js/didMethods/jolo';

const PROVIDER_URL =
  process.env.JOLOCOM_PROVIDER_URL ||
  'https://rinkeby.infura.io/v3/683ec89a2ede42f8a29842b5ebbef450';
const CONTRACT_ADDRESS =
  process.env.JOLOCOM_CONTRACT_ADDRESS ||
  // Default contract address (see github jolocom/jolo-did-method, 'packages/jolo-did-registrar/ts/index.ts')
  '0xd4351c3f383d79ba378ed1875275b1e7b960f120';

const jolocomSDKFactory = {
  provide: JolocomSDK,
  useFactory: (connection: Connection) => {
    const sdk = new JolocomSDK({
      storage: new JolocomTypeormStorage(connection),
    });

    // Use custom testnet endpoint
    const jolo = new JoloDidMethod(PROVIDER_URL, CONTRACT_ADDRESS);
    const mk = new DidMethodKeeper(jolo);
    mk.register('jun', sdk.didMethods.get('jun'));
    sdk.didMethods = mk;

    return sdk;
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
