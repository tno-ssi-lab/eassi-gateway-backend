import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CredentialType } from 'src/types/credential-type.entity';

@Entity()
export class Test {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  context: string;

  @Column('simple-json')
  attributes: string[];

  @OneToMany(
    () => CredentialType,
    type => type.idaType,
  )
  credentialTypes: CredentialType[];

}

@Entity()
export class IdaCredentialType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  context: string;

  // @Column('simple-json')
  // attributes: string[];
  @Column('jsonb', {nullable: true})
  attributes: object[];

  @OneToMany(
    () => CredentialType,
    type => type.idaType,
  )
  credentialTypes: CredentialType[];

}
