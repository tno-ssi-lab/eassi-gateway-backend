import { Module } from '@nestjs/common';
import { ConnectorsModule } from 'src/connectors/connectors.module';
import { RequestsModule } from 'src/requests/requests.module';
import { WebhooksController } from './webhooks/webhooks.controller';

@Module({
  imports: [ConnectorsModule, RequestsModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
