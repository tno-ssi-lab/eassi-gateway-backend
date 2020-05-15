import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { OrganizationsModule } from '../organizations/organizations.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CredentialIssueRequest } from './credential-issue-request.entity';
import { CredentialVerifyRequest } from './credential-verify-request.entity';
import { GetIssueRequestPipe, GetVerifyRequestPipe } from './get-request.pipe';

@Module({
  imports: [
    TypeOrmModule.forFeature([CredentialIssueRequest, CredentialVerifyRequest]),
    OrganizationsModule,
  ],
  providers: [RequestsService, GetIssueRequestPipe, GetVerifyRequestPipe],
  exports: [RequestsService, GetIssueRequestPipe, GetVerifyRequestPipe],
})
export class RequestsModule {}
