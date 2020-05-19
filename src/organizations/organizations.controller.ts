import { Controller, Get, Body, Post } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './create-organization.dto';

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
