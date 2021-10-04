import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { TrinsicService } from './trinsic.service';
import { CredentialVerifyRequest } from 'src/requests/credential-verify-request.entity';
import {
  GetIssueRequestPipe,
  GetVerifyRequestPipe,
} from 'src/requests/requests.pipe';
import { CreateTrinsicSchemaDto } from './create-trinsic-schema.dto';

@Controller('api/connectors/trinsic')
export class TrinsicController {
  constructor(private trinsicService: TrinsicService) {}

  @Get()
  index() {
    return this.trinsicService.findAllSchemas();
  }

  @Get('credentials')
  getCredentials() {
    return this.trinsicService.listCredentialDefinition();
  }

  @Post()
  create(@Body() trinsicSchemaData: CreateTrinsicSchemaDto) {
  return this.trinsicService.createSchema(trinsicSchemaData);
 }

 @Post('invitation')
 createInvitation() {
   return this.trinsicService.createInvitation();
 }

 @Post('verify')
 verify(@Body() { identifier }: { identifier: string },) {
   return this.trinsicService.handleVerifyCredentialRequestForConnection(
     new CredentialVerifyRequest,
     identifier,
   );
 }

}
