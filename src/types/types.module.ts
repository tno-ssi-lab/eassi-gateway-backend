import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypesController } from './types.controller';
import { TypesService } from './types.service';
import { CredentialType } from './credential-type.entity';
import { OrganizationsModule } from 'src/organizations/organizations.module';
import { ConnectorsModule } from 'src/connectors/connectors.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CredentialType]),
    OrganizationsModule,
    ConnectorsModule,
  ],
  controllers: [TypesController],
  providers: [TypesService],
  exports: [TypeOrmModule],
})
export class TypesModule {}
