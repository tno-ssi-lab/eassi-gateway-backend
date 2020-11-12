import { CredentialType } from 'src/types/credential-type.entity';
import { PrimaryGeneratedColumn, Column, OneToMany, Entity } from 'typeorm';

export interface IndySchemaResponse {
  schema_id: string;
  schema: {
    ver: string;
    id: string;
    name: string;
    version: string;
    attrNames: string[];
    seqNo: number;
  };
}

export interface IndyCredDefResponse {
  credential_definition_id: string;
}

@Entity()
export class IndySchema {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  version: string;

  @Column('simple-json')
  attributes: string[];

  @Column({ nullable: true })
  indySchemaId: string;

  @Column({ nullable: true })
  indyCredentialDefinitionId: string;

  @OneToMany(
    () => CredentialType,
    type => type.indySchema,
  )
  credentialTypes: CredentialType[];
}
