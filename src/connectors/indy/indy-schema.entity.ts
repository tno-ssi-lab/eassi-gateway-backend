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
