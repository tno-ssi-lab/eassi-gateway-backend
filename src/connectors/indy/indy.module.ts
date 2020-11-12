import { HttpModule, Module } from '@nestjs/common';
import { IndyService } from './indy.service';
import { IndyController } from './indy.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndySchema } from './indy-schema.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IndySchema]), HttpModule],
  providers: [IndyService],
  exports: [IndyService, TypeOrmModule],
  controllers: [IndyController],
})
export class IndyModule {}
