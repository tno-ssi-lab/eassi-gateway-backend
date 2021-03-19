import { Module } from '@nestjs/common';
import { UtilsController } from './utils.controller';
import { OrganizationsModule } from 'src/organizations/organizations.module';
import { UtilsService } from './utils.service';

@Module({
  imports: [OrganizationsModule],
  controllers: [UtilsController],
  providers: [UtilsService],
})
export class UtilsModule {}
