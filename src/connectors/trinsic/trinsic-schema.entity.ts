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

  @Column({ nullable: true, default: null })
  supportRevocation: boolean;

  @Column({ nullable: true})
  trinsicSchemaId: string;

  @Column({ nullable: true })
  trinsicCredentialDefinitionId: string;

  @OneToMany(
    () => CredentialType,
    type => type.trinsicSchema,
  )
  credentialTypes: CredentialType[];

  //TODO: change to real unique tag
  //Trinsic docs: "Unique tag to differentiate definitions of the same schema"
  //@Column({ unique: true })
  @Column({ nullable: true })
  tag: string;

  get schemaIssuerDid() {
    return this.trinsicSchemaId.split(':')[0];
  }

  get credDefIssuerDid() {
    return this.trinsicCredentialDefinitionId.split(':')[0];
  }
}
