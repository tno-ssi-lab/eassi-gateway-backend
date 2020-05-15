import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { OrganizationsModule } from '../organizations/organizations.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CredentialIssueRequest } from './credential-issue-request.entity';
import { CredentialVerifyRequest } from './credential-verify-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CredentialIssueRequest, CredentialVerifyRequest]),
    OrganizationsModule,
  ],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}
