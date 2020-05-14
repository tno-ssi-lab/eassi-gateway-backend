import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [OrganizationsModule],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}
