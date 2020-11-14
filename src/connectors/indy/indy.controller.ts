import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  IndyIssueCredentialResponse,
  IndyPresentProofResponse,
  IndyService,
} from './indy.service';
import { CreateIndySchemaDto } from './create-indy-schema.dto';
import { inspect } from 'util';
import { CredentialVerifyRequest } from 'src/requests/credential-verify-request.entity';
import {
  GetIssueRequestPipe,
  GetVerifyRequestPipe,
} from 'src/requests/requests.pipe';
import { CredentialIssueRequest } from 'src/requests/credential-issue-request.entity';
import { RequestsService } from 'src/requests/requests.service';
import { ResponseStatus } from '../response-status.enum';
import { RequestsGateway } from 'src/requests/requests.gateway';

@Controller('api/connectors/indy')
export class IndyController {
  constructor(
    private indyService: IndyService,
    private requestsService: RequestsService,
    private gateway: RequestsGateway,
  ) {}

  @Get()
  index() {
    return this.indyService.findAllSchemas();
  }

  @Post()
  create(@Body() indySchemaData: CreateIndySchemaDto) {
    return this.indyService.createSchema(indySchemaData);
  }

  @Post('invitation')
  createInvitation() {
    return this.indyService.createInvitation();
  }

  @Post('verify')
  verify(
    @Query('verifyRequestId', GetVerifyRequestPipe)
    verifyRequest: CredentialVerifyRequest,
    @Body()
    { identifier }: { identifier: string },
  ) {
    this.indyService.handleVerifyCredentialRequestForConnection(
      verifyRequest,
      identifier,
    );
  }

  @Post('issue')
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

  @Post('webhook/topic/present_proof')
  async webhookPresentProof(@Body() body: IndyPresentProofResponse) {
    this.debugWebhook('present_proof', body);

    if (body.state !== 'verified' || body.verified !== 'true') {
      return;
    }

    const {
      verifyRequest,
      data,
    } = await this.indyService.handleVerifyCredentialDisclosureFromWebhook(
      body,
    );

    const responseToken = this.requestsService.encodeVerifyRequestResponse(
      verifyRequest,
      ResponseStatus.success,
      'indy',
      data,
    );

    this.gateway.sendRedirectResponse(
      verifyRequest.requestId,
      ResponseStatus.success,
      `${verifyRequest.callbackUrl}${responseToken}`,
    );
  }

  @Post('webhook/topic/issue_credential')
  async webhookIssueCredential(@Body() body: IndyIssueCredentialResponse) {
    this.debugWebhook('issue_credential', body);

    if (body.state !== 'credential_issued') {
      return;
    }

    const {
      issueRequest,
    } = await this.indyService.handleIssueCredentialDisclosureFromWebhook(body);

    const responseToken = this.requestsService.encodeIssueRequestResponse(
      issueRequest,
      ResponseStatus.success,
      'indy',
    );

    this.gateway.sendRedirectResponse(
      issueRequest.requestId,
      ResponseStatus.success,
      `${issueRequest.callbackUrl}${responseToken}`,
    );
  }

  @Post('webhook/topic/:topic/')
  webhook(@Param('topic') topic: string, @Body() body: any) {
    this.debugWebhook(topic, body);
  }

  protected debugWebhook(topic: string, body: any) {
    console.log(
      'Incomming indy webhook',
      topic,
      inspect(body, false, 10, true),
    );
  }
}
