import { Controller, Get, Query, Param, Body, Post } from '@nestjs/common';

import {
  DecodeIssueRequestPipe,
  GetIssueRequestPipe,
} from '../requests/requests.pipe';
import { CredentialIssueRequest } from '../requests/credential-issue-request.entity';
import { ConnectorsService } from '../connectors/connectors.service';
import { GetConnectorPipe } from '../connectors/get-connector.pipe';
import { ConnectorService } from '../connectors/connector-service.interface';
import { JolocomService } from 'src/connectors/jolocom/jolocom.service';

@Controller('api/issue')
export class IssueController {
  constructor(
    private connectorsService: ConnectorsService,
    private jolocomService: JolocomService,
  ) {}

  @Get()
  async receiveCredentialIssueRequest(
    @Query('token', DecodeIssueRequestPipe)
    issueRequest: CredentialIssueRequest,
  ) {
    return {
      issueRequest,
      availableConnectors: await this.connectorsService
        .availableIssueConnectors(issueRequest)
        .then(cs => cs.map(c => c.name)),
    };
  }

  @Get(':connector')
  async handleCredentialIssueRequest(
    @Param('connector', GetConnectorPipe) connectorService: ConnectorService,
    @Query('issueRequestId', GetIssueRequestPipe)
    issueRequest: CredentialIssueRequest,
  ) {
    return connectorService.handleIssueCredentialRequest(issueRequest);
  }

  @Post('jolocom/receive')
  async handleCredentialIssueReceive(
    @Query('issueRequestId', GetIssueRequestPipe)
    issueRequest: CredentialIssueRequest,
    @Body('token')
    token: string,
  ) {
    return this.jolocomService.handleIssueCredential(issueRequest, token);
  }
}
