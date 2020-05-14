import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
} from 'typeorm';
import { JolocomWallet } from './jolocom-wallet.entity';
import { BaseMetadata } from 'cred-types-jolocom-core/js/types';

@Entity()
export class JolocomCredentialType extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => JolocomWallet,
    wallet => wallet.credentialOffers,
  )
  wallet: JolocomWallet;

  @Column({ unique: true })
  type: string;

  @Column()
  name: string;

  @Column('simple-json')
  context: BaseMetadata['context'];

  @Column('simple-json')
  claimInterface: BaseMetadata['claimInterface'];
}
