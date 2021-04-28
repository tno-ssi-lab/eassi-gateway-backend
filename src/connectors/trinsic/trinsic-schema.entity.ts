import { CredentialType } from 'src/types/credential-type.entity';
import { PrimaryGeneratedColumn, Column, OneToMany, Entity } from 'typeorm';

export interface IndySchemaResponse {
  schemaId: string;
  supportRevocation: boolean;
  version: string;
  name: string;
  attributes: string[];
}

export interface IndyCredDefResponse {
    definitionId: string;
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
  attributes: string[];

  @Column()
  supportRevocation: boolean;

  @Column({ unique: true })
  tag: string;
}
