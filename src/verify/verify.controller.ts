import { Controller, Get, Param, Query } from '@nestjs/common';

import { GetConnectorPipe } from '../connectors/get-connector.pipe';
import { ConnectorService } from '../connectors/connector-service.interface';
import { ConnectorsService } from '../connectors/connectors.service';

import {
  DecodeVerifyRequestPipe,
  GetVerifyRequestPipe,
} from '../requests/requests.pipe';
import { CredentialVerifyRequest } from '../requests/credential-verify-request.entity';
import { RequestsGateway } from '../requests/requests.gateway';

@Controller('api/verify')
export class VerifyController {
  constructor(
    private gateway: RequestsGateway,
    private connectorsService: ConnectorsService,
  ) {
    console.log(this.gateway);
  }

  @Get()
  async receiveCredentialVerifyRequest(
    @Query('token', DecodeVerifyRequestPipe)
    verifyRequest: CredentialVerifyRequest,
  ) {
    return {
      verifyRequest,
      availableConnectors: await this.connectorsService
        .availableVerifyConnectors(verifyRequest)
        .then(cs => cs.map(c => c.type)),
    };
  }

  @Get(':connector')
  async handleCredentialVerifyRequest(
    @Param('connector', GetConnectorPipe) connectorService: ConnectorService,
    @Query('verifyRequestId', GetVerifyRequestPipe)
    verifyRequest: CredentialVerifyRequest,
  ) {
    return { verifyRequest, connectorService };
  }
}
