import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IssueModule } from './issue/issue.module';
import { VerifyModule } from './verify/verify.module';
import { UtilsModule } from './utils/utils.module';
import { ConfigModule } from './config/config.module';
import * as ormConfig from './ormconfig';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRoot(ormConfig),
    IssueModule,
    VerifyModule,
    UtilsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
