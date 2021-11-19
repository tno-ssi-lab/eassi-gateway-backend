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
  constructor(private indyService: IndyService) {}

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
}
