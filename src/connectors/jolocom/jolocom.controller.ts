import { Controller, Get, Post, Body } from '@nestjs/common';
import { JolocomService } from './jolocom.service';
import { CreateJolocomTypeDto } from './create-jolocom-type.dto';

@Controller('api/connectors/jolocom')
export class JolocomController {
  constructor(private jolocomService: JolocomService) {}

  @Get()
  index() {
    return this.jolocomService.findAllTypes();
  }

  @Post()
  create(@Body() jolocomTypeData: CreateJolocomTypeDto) {
    return this.jolocomService.createType(jolocomTypeData);
  }
}
