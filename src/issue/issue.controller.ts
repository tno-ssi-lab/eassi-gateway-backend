import { Controller, Get, Param, Query } from '@nestjs/common';

import { GetConnectorPipe } from '../connectors/get-connector.pipe';
import { ConnectorService } from '../connectors/connector-service.interface';
import { GetIssueRequestPipe } from '../requests/get-request.pipe';
import { CredentialIssueRequest } from '../requests/credential-issue-request.entity';

@Controller('issue')
export class IssueController {
  @Get(':connector')
  async receiveCredentialIssueRequest(
    @Param('connector', GetConnectorPipe) connectorService: ConnectorService,
    @Query('token', GetIssueRequestPipe)
    issueRequest: CredentialIssueRequest,
  ) {
    return issueRequest;
  }
}
