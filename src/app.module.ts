import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IssueModule } from './issue/issue.module';
import { VerifyModule } from './verify/verify.module';
import { UtilsModule } from './utils/utils.module';
import { ConfigModule } from './config/config.module';
import { JolocomCredentialRequestToken } from './connectors/jolocom/jolocom-credential-request-token.entity';
import { JolocomCredentialType } from './connectors/jolocom/jolocom-credential-type.entity';
import { Organization } from './organizations/organization.entity';
import { CredentialIssueRequest } from './requests/credential-issue-request.entity';
import { CredentialVerifyRequest } from './requests/credential-verify-request.entity';
import { CredentialType } from './types/credential-type.entity';
import { JolocomWallet } from './connectors/jolocom/jolocom-wallet.entity';
import { IndySchema } from './connectors/indy/indy-schema.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      synchronize: true,
      entities: [
        IndySchema,
        JolocomCredentialRequestToken,
        JolocomCredentialType,
        JolocomWallet,
        Organization,
        CredentialIssueRequest,
        CredentialVerifyRequest,
        CredentialType,
        'node_modules/@jolocom/sdk-storage-typeorm/js/src/entities/*.js',
      ],
    }),
    IssueModule,
    VerifyModule,
    UtilsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
