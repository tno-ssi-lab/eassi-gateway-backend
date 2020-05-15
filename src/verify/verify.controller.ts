import { Controller, Get, Param, Query } from '@nestjs/common';
import { GetConnectorPipe } from '../connectors/get-connector.pipe';
import { ConnectorService } from 'src/connectors/connector-service.interface';
import { GetVerifyRequestPipe } from 'src/requests/get-request.pipe';
import { CredentialVerifyRequest } from 'src/requests/credential-verify-request.entity';

@Controller('verify')
export class VerifyController {
  @Get(':connector')
  async receiveCredentialVerifyRequest(
    @Param('connector', GetConnectorPipe) connectorService: ConnectorService,
    @Query('token', GetVerifyRequestPipe)
    verifyRequest: CredentialVerifyRequest,
  ) {
    return verifyRequest;
  }
}
