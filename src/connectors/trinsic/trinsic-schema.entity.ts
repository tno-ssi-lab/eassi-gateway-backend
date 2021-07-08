import { CredentialType } from 'src/types/credential-type.entity';
import { PrimaryGeneratedColumn, Column, OneToMany, Entity } from 'typeorm';

export interface TrinsicSchemaResponse {
  schemaId: string;
  name: string;
  version: string;
  attributeNames: string[];
}

export interface TrinsicCredDefResponse {
    schemaId: string;
    definitionId: string;
    supportRevocation: boolean;
    tag: string;
}

@Entity()
export class TrinsicSchema {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  version: string;

  @Column('simple-json')
  attributeNames: string[];

  @Column()
  supportRevocation: boolean;

  @Column({ nullable: true })
  trinsicSchemaId: string;

  @Column({ nullable: true })
  trinsicCredentialDefinitionId: string;

  @OneToMany(
    () => CredentialType,
    type => type.trinsicSchema,
  )
  credentialTypes: CredentialType[];

  @Column({ unique: true })
  tag: string;
}
