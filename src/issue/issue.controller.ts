import {
  Controller,
  Get,
  Query,
  Param,
  Body,
  Post,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { classToPlain } from 'class-transformer';

import {
  DecodeIssueRequestPipe,
  GetIssueRequestPipe,
} from '../requests/requests.pipe';
import { CredentialIssueRequest } from '../requests/credential-issue-request.entity';
import { ConnectorsService } from '../connectors/connectors.service';
import { GetConnectorPipe } from '../connectors/get-connector.pipe';
import { ConnectorService } from '../connectors/connector-service.interface';
import { JolocomService } from 'src/connectors/jolocom/jolocom.service';
import { IdaService } from 'src/connectors/ida/ida.service';
import { IndyService } from 'src/connectors/indy/indy.service';
import { TrinsicService } from 'src/connectors/trinsic/trinsic.service';
import { WaltidService } from 'src/connectors/waltid/waltid.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('api/issue')
export class IssueController {
  constructor(
    private connectorsService: ConnectorsService,
    private jolocomService: JolocomService,
    private indyService: IndyService,
    private idaService: IdaService,
    private trinsicService: TrinsicService,
    private waltidService: WaltidService
  ) {}

  @Get()
  async receiveCredentialIssueRequest(
    @Query('token', DecodeIssueRequestPipe)
    issueRequest: CredentialIssueRequest,
  ) {
    return {
      issueRequest: classToPlain(issueRequest),
      availableConnectors: await this.connectorsService
        .availableIssueConnectors(issueRequest)
        .then((cs) => cs.map((c) => c.name)),
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

  @Post('indy/issue')
  issue(
    @Query('issueRequestId', GetIssueRequestPipe)
    issueRequest: CredentialIssueRequest,
    @Body()
    { identifier }: { identifier: string },
  ) {
    this.indyService.handleIssueCredentialRequestForConnection(
      issueRequest,
      identifier,
    );
  }

  @Post('trinsic/issue')
  issueTrinsic(
    @Query('issueRequestId', GetIssueRequestPipe)
    issueRequest: CredentialIssueRequest,
    @Body() { identifier }: { identifier: string },) {
    return this.trinsicService.handleIssueCredentialRequestForConnection(
      issueRequest,
      identifier,
    );
  }
  @Post('trinsic/issuereponse')
  issueTrinsicResponse(
    @Query('issueRequestId', GetIssueRequestPipe)
    issueRequest: CredentialIssueRequest,
    @Body()
    body: unknown,){

      
    return this.trinsicService.handleIssueCredentialDisclosure(
      issueRequest,
      body
    );
  }

  @Post('waltid/issue')
  issueWaltid(
    @Query('issueRequestId', GetIssueRequestPipe)
    issueRequest: CredentialIssueRequest,
    @Body() { identifier }: { identifier: string },) {
    return this.waltidService.handleIssueCredentialRequestForConnection(
      issueRequest,
      identifier,
    );
  }
  @Post('waltid/issuereponse')
  issueWaltidResponse(
    @Query('issueRequestId', GetIssueRequestPipe)
    issueRequest: CredentialIssueRequest,
    @Body()
    body: unknown,){

      
    return this.waltidService.handleIssueCredentialDisclosure(
      issueRequest,
      body
    );
  }
}
