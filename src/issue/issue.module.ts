import { Module } from '@nestjs/common';
import { IssueController } from './issue.controller';

@Module({
  controllers: [IssueController]
})
export class IssueModule {}
