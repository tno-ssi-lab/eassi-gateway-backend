import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CredentialType } from 'src/types/credential-type.entity';

@Entity()
export class IdaCredentialType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  context: string;

  @Column('jsonb', {nullable: true})
  attributes: object[];

  @OneToMany(
    () => CredentialType,
    (type) => type.idaType,
  )
  credentialTypes: CredentialType[];

}
