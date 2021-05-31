import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CredentialType } from './credential-type.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from 'src/organizations/organization.entity';
import { JolocomCredentialType } from 'src/connectors/jolocom/jolocom-credential-type.entity';
import { IndySchema } from 'src/connectors/indy/indy-schema.entity';
import { TrinsicSchema } from 'src/connectors/trinsic/trinsic-schema.entity';

interface CreateData {
  organizationId: number | string;
  jolocomCredentialTypeId?: number | string;
  indySchemaId?: number | string;
  trinsicSchemaId?: number | string;
  irmaType: string;
  type: string;
}

@Injectable()
export class TypesService {
  constructor(
    @InjectRepository(CredentialType)
    private readonly typesRespository: Repository<CredentialType>,
    @InjectRepository(Organization)
    private readonly organizationsRepository: Repository<Organization>,
    @InjectRepository(JolocomCredentialType)
    private readonly jolocomTypeRepository: Repository<JolocomCredentialType>,
    @InjectRepository(IndySchema)
    private readonly indySchemasRepository: Repository<IndySchema>,
    @InjectRepository(TrinsicSchema)
    private readonly trinsicSchemasRepository: Repository<TrinsicSchema>,
  ) {}

  async findAll() {
    return this.typesRespository.find({
      relations: ['organization', 'jolocomType'],
    });
  }

  async create({
    organizationId,
    jolocomCredentialTypeId,
    indySchemaId,
    trinsicSchemaId,
    irmaType,
    type,
  }: CreateData) {
    const organization = await this.organizationsRepository.findOneOrFail(
      organizationId,
    );
    const jolocomCredentialType = jolocomCredentialTypeId
      ? await this.jolocomTypeRepository.findOneOrFail(jolocomCredentialTypeId)
      : null;
    const indySchema = indySchemaId
      ? await this.indySchemasRepository.findOneOrFail(indySchemaId)
      : null;
    const trinsicSchema = trinsicSchemaId
      ? await this.trinsicSchemasRepository.findOneOrFail(trinsicSchemaId)
      : null;

    const credentialType = new CredentialType();

    credentialType.type = type;
    credentialType.irmaType = irmaType;
    credentialType.organization = organization;
    credentialType.jolocomType = jolocomCredentialType;
    credentialType.indySchema = indySchema;
    credentialType.trinsicSchema = trinsicSchema;

    return this.typesRespository.save(credentialType);
  }
}
