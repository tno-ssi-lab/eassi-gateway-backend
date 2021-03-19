import { Body, Controller, Logger, Param, Post } from '@nestjs/common';
import { inspect } from 'util';
import {
  IndyPresentProofResponse,
  IndyIssueCredentialResponse,
  IndyService,
} from 'src/connectors/indy/indy.service';
import { ResponseStatus } from 'src/connectors/response-status.enum';
import { RequestsGateway } from 'src/requests/requests.gateway';
import { RequestsService } from 'src/requests/requests.service';

@Controller('webhooks')
export class WebhooksController {
  logger: Logger;

  constructor(
    private readonly indyService: IndyService,
    private readonly requestsService: RequestsService,
    private readonly gateway: RequestsGateway,
  ) {
    this.logger = new Logger(WebhooksController.name);
  }

  @Post('webhook/topic/present_proof')
  async webhookPresentProof(@Body() body: IndyPresentProofResponse) {
    this.debugWebhook('present_proof', body);

    if (body.state !== 'verified' || body.verified !== 'true') {
      return;
    }

    const verifyRequest = await this.requestsService.findVerifyRequestByRequestId(
      body.presentation_request_dict.comment,
    );

    const data = await this.indyService.handleVerifyCredentialDisclosureFromWebhook(
      verifyRequest,
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

    const issueRequest = await this.requestsService.findIssueRequestByRequestId(
      body.credential_proposal_dict.comment,
    );

    await this.indyService.handleIssueCredentialDisclosureFromWebhook(
      issueRequest,
      body,
    );

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
    this.logger.debug(
      `Incomming indy webhook ${topic} ${inspect(body, false, 10, true)}`,
    );
  }
}
