import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Organization } from './organization.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private organizationsRepository: Repository<Organization>,
  ) {}

  findAll() {
    return this.organizationsRepository.find();
  }

  createFromName(name: string) {
    const organization = new Organization();
    organization.name = name;
    organization.sharedSecret = Organization.randomSecret();
    return this.organizationsRepository.save(organization);
  }
}
