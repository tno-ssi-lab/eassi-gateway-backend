import { Body, Controller, Get, Post } from '@nestjs/common';
import { IndyService } from './indy.service';
import { CreateIndySchemaDto } from './create-indy-schema.dto';

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
}
