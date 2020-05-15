import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { BaseMetadata } from 'cred-types-jolocom-core/js/types';
import { CredentialType } from 'src/types/credential-type.entity';

@Entity()
export class JolocomCredentialType extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  type: string;

  @Column()
  name: string;

  @Column('simple-json')
  context: BaseMetadata['context'];

  @Column('simple-json')
  claimInterface: BaseMetadata['claimInterface'];

  @OneToMany(
    () => CredentialType,
    type => type.organization,
  )
  credentialTypes: CredentialType[];
}
