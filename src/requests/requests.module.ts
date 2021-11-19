import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// import { ConnectorsService } from '../connectors/connectors.service';

import { OrganizationsModule } from '../organizations/organizations.module';
import { TypesModule } from 'src/types/types.module';

import { CredentialIssueRequest } from './credential-issue-request.entity';
import { CredentialVerifyRequest } from './credential-verify-request.entity';
import { RequestsService } from './requests.service';
import {
  DecodeIssueRequestPipe,
  DecodeVerifyRequestPipe,
  GetIssueRequestPipe,
  GetVerifyRequestPipe,
} from './requests.pipe';
import { RequestsGateway } from './requests.gateway';
import { ConnectorsModule } from 'src/connectors/connectors.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CredentialIssueRequest, CredentialVerifyRequest]),
    OrganizationsModule,
    TypesModule,
    ConnectorsModule
  ],
  providers: [
    // ConnectorsService,
    RequestsService,
    DecodeIssueRequestPipe,
    GetIssueRequestPipe,
    DecodeVerifyRequestPipe,
    GetVerifyRequestPipe,
    RequestsGateway,
  ],
  exports: [
    RequestsService,
    DecodeIssueRequestPipe,
    GetIssueRequestPipe,
    DecodeVerifyRequestPipe,
    GetVerifyRequestPipe,
    RequestsGateway,
  ],
})
export class RequestsModule {}
