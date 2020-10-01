import {
  Controller,
  Get,
  Body,
  Post,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './create-organization.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('api/organizations')
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  @Get()
  index() {
    return this.organizationsService.findAll();
  }

  @Post()
  create(@Body() organizationParams: CreateOrganizationDto) {
    return this.organizationsService.createFromName(organizationParams.name);
  }
}
