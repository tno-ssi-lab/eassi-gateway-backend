import { forwardRef, Module } from '@nestjs/common';
import { TypesController } from './types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CredentialType } from './credential-type.entity';
import { TypesService } from './types.service';
import { OrganizationsModule } from 'src/organizations/organizations.module';
import { JolocomModule } from 'src/connectors/jolocom/jolocom.module';
import { IndyModule } from 'src/connectors/indy/indy.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CredentialType]),
    OrganizationsModule,
    JolocomModule,
    forwardRef(() => IndyModule),
  ],
  controllers: [TypesController],
  providers: [TypesService],
  exports: [TypeOrmModule],
})
export class TypesModule {}
