import { Module } from '@nestjs/common';

import { ConnectorsModule } from '../connectors/connectors.module';
import { RequestsModule } from '../requests/requests.module';

import { VerifyController } from './verify.controller';

@Module({
  imports: [ConnectorsModule, RequestsModule],
  controllers: [VerifyController],
})
export class VerifyModule {}
