import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
} from '@nestjs/websockets';
import { CredentialVerifyRequest } from './credential-verify-request.entity';
import { DecodeVerifyRequestPipe } from './get-request.pipe';

@WebSocketGateway()
export class RequestsGateway {
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
}
