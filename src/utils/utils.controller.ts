import { Controller, Post, Body, Param } from '@nestjs/common';
import { OrganizationsService } from 'src/organizations/organizations.service';
import { UtilsService } from './utils.service';

@Controller('utils')
export class UtilsController {
  constructor(
    private organizationsService: OrganizationsService,
    private utilsService: UtilsService,
  ) {}

  @Post('jwt/:organizationId')
  async generateJwt(
    @Param('organizationId') organizationId: string,
    @Body() body: object,
  ) {
    const organization = await this.organizationsService.find(organizationId);
    const jwt = this.utilsService.createSignedJwt(body, organization);
    return jwt;
  }
}
