import { Controller, Get, Post, Body } from '@nestjs/common';
import { TrinsicService } from './trinsic.service';
//import { CreateTrinsicTypeDto } from './create-trinsic-type.dto';

@Controller('api/connectors/trinsic')
export class TrinsicController {
  constructor(private trinsicService: TrinsicService) {}

  @Get()
  index() {
    //return this.trinsicService.findAllTypes();
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
