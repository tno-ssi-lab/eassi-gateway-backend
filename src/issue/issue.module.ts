import { Module } from '@nestjs/common';
import { IssueController } from './issue.controller';
import { ConnectorsModule } from 'src/connectors/connectors.module';
import { RequestsModule } from 'src/requests/requests.module';

@Module({
  imports: [ConnectorsModule, RequestsModule],
  controllers: [IssueController],
})
export class IssueModule {}
