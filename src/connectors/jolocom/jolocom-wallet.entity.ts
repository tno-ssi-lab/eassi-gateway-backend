import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { randomBytes } from 'crypto';

import { Organization } from '../../organizations/organization.entity';
import { JolocomCredentialType } from './jolocom-credential-type.entity';

const JOLOCOM_WALLET_SEED_BYTES = 32;
const JOLOCOM_WALLET_PASSWORD_BYTES = 16;

@Entity()
export class JolocomWallet extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ update: false })
  encryptedSeedHex: string;

  @Column({ update: false })
  password: string;

  @OneToOne(
    () => Organization,
    organization => organization.jolocomWallet,
  )
  @JoinColumn()
  organization: Organization;

  @OneToMany(
    () => JolocomCredentialType,
    credentialOffer => credentialOffer.wallet,
  )
  credentialOffers: JolocomCredentialType[];

  static randomPassword() {
    return randomBytes(JOLOCOM_WALLET_PASSWORD_BYTES).toString('hex');
  }

  static randomSeed() {
    return randomBytes(JOLOCOM_WALLET_SEED_BYTES);
  }

  get encryptedSeed(): Buffer {
    return Buffer.from(this.encryptedSeedHex, 'hex');
  }

  set encryptedSeed(seed: Buffer) {
    this.encryptedSeedHex = seed.toString('hex');
  }
}
