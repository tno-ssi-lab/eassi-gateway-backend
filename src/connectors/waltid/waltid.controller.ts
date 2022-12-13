import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { WaltidService } from './waltid.service';
import { CreateWaltidSchemaDto } from './create-waltid-schema.dto';

@Controller('api/connectors/waltid')
export class WaltidController {
  constructor(private waltidService: WaltidService) { }

  @Get()
  index() {
    return this.waltidService.findAllSchemas();
  }

  @Post()
  create(@Body() trinsicSchemaData: CreateWaltidSchemaDto) {
    return this.waltidService.createSchema(trinsicSchemaData);
  }

  @Post('invitation')
  createInvitation() {
    return this.waltidService.createInvitation();
  }
}