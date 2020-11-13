import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { IndyService } from './indy.service';
import { CreateIndySchemaDto } from './create-indy-schema.dto';
import { inspect } from 'util';

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

  @Post('webhook/topic/:topic/')
  webhook(@Param('topic') topic: string, @Body() body: any) {
    console.log(
      'Incomming indy webhook',
      topic,
      inspect(body, false, 10, true),
    );
    // TODO: Implement callbacks for accepted connections and issued credentials.
  }
}
