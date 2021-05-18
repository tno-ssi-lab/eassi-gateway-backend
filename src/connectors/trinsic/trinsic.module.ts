import { HttpModule, Module } from '@nestjs/common';
import { Connection } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CredentialsServiceClient, ProviderServiceClient, WalletServiceClient, Credentials, ProviderCredentials } from '@trinsic/service-clients';
import { TrinsicService } from './trinsic.service';
import { TrinsicSchema } from './trinsic-schema.entity';
import { TrinsicController } from './trinsic.controller';
import { TrinsicInvitation } from './trinsic-invitation.entity';

const walletClient = {
  provide: WalletServiceClient,
  useFactory: (connection: Connection) => {
    const walletClient = new WalletServiceClient(
      new Credentials("KysnBkxKkaCdh9QHsD6WmlyFqVYxYjZSJ7rhd8b4aMQ"),
      { noRetryPolicy: true }
    );
    
    return walletClient;
  },
  inject: [Connection],
};

const credentialsClient = {
  provide: CredentialsServiceClient,
  useFactory: (connection: Connection) => {
    const credentialsClient = new CredentialsServiceClient(
      new Credentials("KysnBkxKkaCdh9QHsD6WmlyFqVYxYjZSJ7rhd8b4aMQ"),
      { noRetryPolicy: true }
    );
    
    
    return credentialsClient;
  },
  inject: [Connection],
};


@Module({
  imports: [TypeOrmModule.forFeature([TrinsicSchema, TrinsicInvitation]), HttpModule],
  providers: [TrinsicService, walletClient, credentialsClient],
  controllers: [TrinsicController],
  exports: [TrinsicService, TypeOrmModule],
})
export class TrinsicModule {}
