import { Controller, Get, Post, Body } from '@nestjs/common';
import { TrinsicService } from './trinsic.service';
import { CreateTrinsicSchemaDto } from './create-trinsic-schema.dto';

@Controller('api/connectors/trinsic')
export class TrinsicController {
  constructor(private trinsicService: TrinsicService) {}

  @Get()
  index() {
    //return this.TrinsicService.findAllTypes();
    return "Not implemented yet";
  }

  @Post()
  //create(@Body() trinsicTypeData: CreateTrinsicTypeDto) {
 //   return this.trinsicService.createType(trinsicTypeData);
 // }
 create(@Body() trinsicTypeData: any) {
  return "Post has not been implemented yet.";
 }
}
