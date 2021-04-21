import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Organization } from './organization.entity';
import { ConnectorsService } from 'src/connectors/connectors.service';

@Injectable()
export class OrganizationsService {
  logger: Logger;

  constructor(
    @InjectRepository(Organization)
    private organizationsRepository: Repository<Organization>,
    private connectorsService: ConnectorsService,
  ) {
    this.logger = new Logger(OrganizationsService.name);
  }

  async findAll() {
    return this.organizationsRepository.find({
      relations: ['credentialTypes'],
    });
  }

  async find(id: number | string) {
    return this.organizationsRepository.findOne(id);
  }

  async findByIdentifier(uuid: string) {
    return this.organizationsRepository.findOne({
      uuid,
    });
  }

  async createFromName(name: string) {
    this.logger.debug(`Creating organization with name ${name}`);
    const organization = new Organization();
    organization.name = name;
    organization.sharedSecret = Organization.randomSecret();
    await this.organizationsRepository.save(organization);

    // TODO: Move to queue if needed.
    await this.connectorsService.registerOrganization(organization);

    this.logger.debug(`Created organization (id: ${organization.id})`);
    // return organization;
    return {
      "id": organization.id,
      "name": organization.name,
      "uuid": organization.uuid,
      "sharedSecret": organization.sharedSecret,
    };
  }
}
