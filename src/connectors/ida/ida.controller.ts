import { Controller, Get, Post, Body } from '@nestjs/common';
import { IdaService } from './ida.service';
// import { CreateIdaTypeDto } from './create-ida-type.dto';

@Controller('api/connectors/ida')
export class IdaController {
  constructor(private idaService: IdaService) {}

  @Get()
  index() {
    // return this.idaService.findAllTypes();
    return "Not implemented yet";
  }

  @Post()
  // create(@Body() idaTypeData: CreateIdaTypeDto) {
  //   return this.idaService.createType(idaTypeData);
  // }
  create(@Body() idaTypeData: any) {
    return "Post has not been implemented yet.";
  }
}
