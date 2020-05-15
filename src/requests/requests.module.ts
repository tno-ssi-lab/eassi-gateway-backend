import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrganizationsModule } from '../organizations/organizations.module';
import { TypesModule } from 'src/types/types.module';

import { CredentialIssueRequest } from './credential-issue-request.entity';
import { CredentialVerifyRequest } from './credential-verify-request.entity';
import { RequestsService } from './requests.service';
import { GetIssueRequestPipe, GetVerifyRequestPipe } from './get-request.pipe';

@Module({
  imports: [
    TypeOrmModule.forFeature([CredentialIssueRequest, CredentialVerifyRequest]),
    OrganizationsModule,
    TypesModule,
  ],
  providers: [RequestsService, GetIssueRequestPipe, GetVerifyRequestPipe],
  exports: [RequestsService, GetIssueRequestPipe, GetVerifyRequestPipe],
})
export class RequestsModule {}
