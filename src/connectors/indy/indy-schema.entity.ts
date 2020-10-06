import { CredentialType } from 'src/types/credential-type.entity';
import { PrimaryGeneratedColumn, Column, OneToMany, Entity } from 'typeorm';

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

  @Column()
  indySchemaId: string;

  @Column()
  indyCredentialDefinitionId: string;

  @OneToMany(
    () => CredentialType,
    type => type.indySchema,
  )
  credentialTypes: CredentialType[];
}
