import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { WalletModule } from './wallet/wallet.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { ConnectorsModule } from './connectors/connectors.module';
import { RequestsModule } from './requests/requests.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './dev.sqlite3',
      synchronize: true,
      autoLoadEntities: true,
    }),
    WalletModule,
    OrganizationsModule,
    ConnectorsModule,
    RequestsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
