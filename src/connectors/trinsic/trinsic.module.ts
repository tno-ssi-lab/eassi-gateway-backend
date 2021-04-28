import { Module } from '@nestjs/common';
import { CredentialsServiceClient, ProviderServiceClient, WalletServiceClient, Credentials, ProviderCredentials } from '@trinsic/service-clients';
import { TrinsicService } from './trinsic.service';
import { TrinsicController } from './trinsic.controller';


// Credentials API
const credentialsClient = new CredentialsServiceClient(
  new Credentials("KysnBkxKkaCdh9QHsD6WmlyFqVYxYjZSJ7rhd8b4aMQ"),
  { noRetryPolicy: true }
);

// Wallet API
const walletClient = new WalletServiceClient(
  new Credentials("KysnBkxKkaCdh9QHsD6WmlyFqVYxYjZSJ7rhd8b4aMQ"),
  { noRetryPolicy: true }
);


@Module({
  providers: [TrinsicService],
  exports: [TrinsicService],
  controllers: [TrinsicController],
})
export class TrinsicModule {}
