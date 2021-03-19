// import { Controller, Body, Post, Query } from '@nestjs/common';
// import { GetVerifyRequestPipe } from '../../requests/requests.pipe';
// import { CredentialVerifyRequest } from '../../requests/credential-verify-request.entity';
// import { IrmaService } from './irma.service';

// @Controller('api/connectors/irma')
// export class IrmaController {
//   constructor(private irmaService: IrmaService) {}

//   @Post('disclose')
//   handleCredentialVerifyDisclosure(
//     @Query('verifyRequestId', GetVerifyRequestPipe)
//     verifyRequest: CredentialVerifyRequest,
//     @Body()
//     irmaJwt: string,
//   ) {
//     const result = this.irmaService.handleIrmaDisclosure(
//       verifyRequest,
//       irmaJwt,
//     );

//     return { irmaJwt, verifyRequest };
//   }
// }
