import { CredentialType } from 'src/types/credential-type.entity';
import { PrimaryGeneratedColumn, Column, OneToMany, Entity } from 'typeorm';

export interface WaltidSchemaResponse {
  schemaId: string;
  name: string;
  version: string;
  attributeNames: string[];
}

export interface WaltidCredDefResponse {
    schemaId: string;
    definitionId: string;
    supportRevocation: boolean;
    tag: string;
}

@Entity()
export class WaltidSchema {
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
  waltidSchemaId: string;

  @Column({ nullable: true })
  waltidCredentialDefinitionId: string;

  @OneToMany(
    () => CredentialType,
    type => type.waltidSchema,
  )
  credentialTypes: CredentialType[];

  //TODO: change to real unique tag
  //Trinsic docs: "Unique tag to differentiate definitions of the same schema"
  //@Column({ unique: true })
  @Column({ nullable: true })
  tag: string;

  get schemaIssuerDid() {
    return this.waltidSchemaId.split(':')[0];
  }

  get credDefIssuerDid() {
    return this.waltidCredentialDefinitionId.split(':')[0];
  }
}