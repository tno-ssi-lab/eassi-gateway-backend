import { Module } from '@nestjs/common';
import { UtilsController } from './utils.controller';
import { OrganizationsModule } from 'src/organizations/organizations.module';
import { RequestsModule } from 'src/requests/requests.module';
import { UtilsService } from './utils.service';

@Module({
  imports: [RequestsModule, OrganizationsModule],
  controllers: [UtilsController],
  providers: [UtilsService],
})
export class UtilsModule {}
