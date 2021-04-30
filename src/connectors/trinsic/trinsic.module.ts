import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CredentialsServiceClient, ProviderServiceClient, WalletServiceClient, Credentials, ProviderCredentials } from '@trinsic/service-clients';
import { TrinsicService } from './trinsic.service';
import { TrinsicSchema } from './trinsic-schema.entity';
import { TrinsicController } from './trinsic.controller';
import { TrinsicInvitation } from './trinsic-invitation.entity';


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
  imports: [TypeOrmModule.forFeature([TrinsicSchema, TrinsicInvitation]), HttpModule],
  providers: [TrinsicService],
  controllers: [TrinsicController],
  exports: [TrinsicService, TypeOrmModule],
})
export class TrinsicModule {}
