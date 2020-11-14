import { forwardRef, HttpModule, Module } from '@nestjs/common';
import { IndyService } from './indy.service';
import { IndyController } from './indy.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndySchema } from './indy-schema.entity';
import { IndyInvitation } from './indy-invitation.entity';
import { RequestsModule } from 'src/requests/requests.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IndySchema, IndyInvitation]),
    HttpModule,
    forwardRef(() => RequestsModule),
  ],
  providers: [IndyService],
  exports: [IndyService, TypeOrmModule],
  controllers: [IndyController],
})
export class IndyModule {}
