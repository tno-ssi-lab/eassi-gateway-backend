import {
  Controller,
  Post,
  Body,
  Get,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { TypesService } from './types.service';
import { CreateTypeDto } from './create-type.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('api/types')
export class TypesController {
  constructor(private typesService: TypesService) {}
  @Get()
  index() {
    return this.typesService.findAll();
  }

  @Post()
  create(@Body() typeData: CreateTypeDto) {
    return this.typesService.create(typeData);
  }
}
