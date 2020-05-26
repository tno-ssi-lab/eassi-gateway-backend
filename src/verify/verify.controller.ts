import { Controller, Get, Param, Query, Post, Body } from '@nestjs/common';

import { GetConnectorPipe } from '../connectors/get-connector.pipe';
import { ConnectorService } from '../connectors/connector-service.interface';
import { ConnectorsService } from '../connectors/connectors.service';

import {
  DecodeVerifyRequestPipe,
  GetVerifyRequestPipe,
} from '../requests/requests.pipe';
import { CredentialVerifyRequest } from '../requests/credential-verify-request.entity';
import { RequestsGateway } from '../requests/requests.gateway';
import { IrmaService } from 'src/connectors/irma/irma.service';
import { RequestsService } from 'src/requests/requests.service';
import { ResponseStatus } from 'src/connectors/response-status.enum';

@Controller('api/verify')
export class VerifyController {
  constructor(
    private gateway: RequestsGateway,
    private connectorsService: ConnectorsService,
    private irmaService: IrmaService,
    private requestsService: RequestsService,
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
    console.log(verifyRequest, connectorService);
    return connectorService.handleVerifyCredentialRequest(verifyRequest);
  }

  @Post('irma/disclose')
  handleIrmaVerifyDisclosure(
    @Query('verifyRequestId', GetVerifyRequestPipe)
    verifyRequest: CredentialVerifyRequest,
    @Body('jwt')
    irmaJwt: string,
  ) {
    try {
      // TODO: Abstract this properly (also for jolocom)
      const result = this.irmaService.validateIrmaDisclosure(
        verifyRequest,
        irmaJwt,
      );

      const responseToken = this.requestsService.encodeVerifyRequestResponse(
        verifyRequest,
        ResponseStatus.success,
        'irma',
        result,
      );

      this.gateway.sendRedirectResponse(
        verifyRequest.requestId,
        ResponseStatus.success,
        `${verifyRequest.callbackUrl}${responseToken}`,
      );
    } catch {
      // TODO: handle bad flow
    }
  }
}
