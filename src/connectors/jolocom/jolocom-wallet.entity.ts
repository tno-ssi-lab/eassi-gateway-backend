import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { randomBytes } from 'crypto';

import { Organization } from '../../organizations/organization.entity';

const JOLOCOM_WALLET_SEED_BYTES = 32;
const JOLOCOM_WALLET_PASSWORD_BYTES = 16;

@Entity()
export class JolocomWallet {
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
