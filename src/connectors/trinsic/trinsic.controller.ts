import { Controller, Get, Post, Body } from '@nestjs/common';
import { TrinsicService } from './trinsic.service';
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
}
