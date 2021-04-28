import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

import { CredentialVerifyRequest } from './credential-verify-request.entity';
import {
  DecodeVerifyRequestPipe,
  DecodeIssueRequestPipe,
} from './requests.pipe';
import { ConnectorsService } from '../connectors/connectors.service';
import { ResponseStatus } from 'src/connectors/response-status.enum';
import { CredentialIssueRequest } from './credential-issue-request.entity';
import { RequestsService } from './requests.service';

@WebSocketGateway()
export class RequestsGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private connectorsService: ConnectorsService,
    private requestsService: RequestsService
  ) {}

  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: string): string {
    return `${message.toLocaleUpperCase()}!`;
  }

  @SubscribeMessage('verify-request')
  handleVerifyRequest(
    @MessageBody(DecodeVerifyRequestPipe)
    verifyRequest: CredentialVerifyRequest,
  ): CredentialVerifyRequest {
    return verifyRequest;
  }

  @SubscribeMessage('issue-request')
  handleIssueRequest(
    @MessageBody(DecodeIssueRequestPipe)
    issueRequest: CredentialIssueRequest,
  ): CredentialIssueRequest {
    return issueRequest;
  }

  @SubscribeMessage('request-started')
  handleRequestStarted(
    @MessageBody()
    requestId: string,
    @ConnectedSocket()
    client: Socket,
  ) {
    console.log('Client', client.id, 'joined', requestId);
    client.join(requestId);
  }

  @SubscribeMessage('request-success')
  async handleRequestDone(
    @MessageBody()
    { requestId, connector }: { requestId: string; connector: string },
  ) {
    console.log('Done with request', requestId);

    const request = await this.requestsService.findRequestByRequestId(
      requestId,
    );

    if (request instanceof CredentialIssueRequest) {
      const responseToken = this.requestsService.encodeIssueRequestResponse(
        request,
        ResponseStatus.success,
        connector,
      );

      this.sendRedirectResponse(
        requestId,
        ResponseStatus.success,
        `${request.callbackUrl}${responseToken}`,
      );
    } else {
      // FIXME: Raise error? We should probably only allow issue request to be
      // done manually.

      console.log('Handling manual confirmation of success');

      const service = this.connectorsService.getConnector(connector);
      const data = await service.handleVerifyCredentialDisclosure(request,"");
      // const data = {"demo": "test"}

      const responseToken = this.requestsService.encodeVerifyRequestResponse(
        request,
        ResponseStatus.success,
        connector,
        data
      );

      this.sendRedirectResponse(
        requestId,
        ResponseStatus.success,
        `${request.callbackUrl}${responseToken}`,
      );
    }
  }

  @SubscribeMessage('request-cancelled')
  async handleRequestCancelled(
    @MessageBody()
    requestId: string,
  ) {
    console.log('Done with request', requestId);

    const request = await this.requestsService.findRequestByRequestId(
      requestId,
    );

    let responseToken: string;

    if (request instanceof CredentialIssueRequest) {
      responseToken = this.requestsService.encodeIssueRequestResponse(
        request,
        ResponseStatus.cancelled,
      );
    } else {
      responseToken = this.requestsService.encodeVerifyRequestResponse(
        request,
        ResponseStatus.cancelled,
      );
    }

    this.sendRedirectResponse(
      requestId,
      ResponseStatus.cancelled,
      `${request.callbackUrl}${responseToken}`,
    );
  }

  sendRedirectResponse(
    requestId: string,
    status: ResponseStatus,
    redirectUrl: string,
  ) {
    console.log('In gateway, sending', requestId, status);
    this.server.to(requestId).emit('redirect', { status, redirectUrl });
  }
}
