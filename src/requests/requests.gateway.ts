import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

import { CredentialVerifyRequest } from './credential-verify-request.entity';
import { DecodeVerifyRequestPipe } from './requests.pipe';
import { ResponseStatus } from 'src/connectors/response-status.enum';

@WebSocketGateway()
export class RequestsGateway {
  @WebSocketServer()
  server: Server;

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

  sendRedirectResponse(
    requestId: string,
    status: ResponseStatus,
    redirectUrl: string,
  ) {
    console.log('In gateway, sending', requestId, status);
    this.server.to(requestId).emit('redirect', { status, redirectUrl });
  }
}
