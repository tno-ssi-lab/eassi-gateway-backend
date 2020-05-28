import { Module } from '@nestjs/common';
import { IssueController } from './issue.controller';
import { ConnectorsModule } from 'src/connectors/connectors.module';
import { RequestsModule } from 'src/requests/requests.module';
import { JolocomModule } from 'src/connectors/jolocom/jolocom.module';

@Module({
  imports: [ConnectorsModule, RequestsModule, JolocomModule],
  controllers: [IssueController],
})
export class IssueModule {}
