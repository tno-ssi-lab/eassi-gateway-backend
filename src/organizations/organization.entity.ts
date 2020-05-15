import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  Generated,
} from 'typeorm';
import { randomBytes } from 'crypto';
import { JolocomWallet } from '../connectors/jolocom/jolocom-wallet.entity';
import { CredentialVerifyRequest } from 'src/requests/credential-verify-request.entity';
import { CredentialIssueRequest } from 'src/requests/credential-issue-request.entity';

const JWT_SECRET_BITS = 32;

@Entity()
export class Organization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  sharedSecret: string;

  @Column()
  @Generated('uuid')
  uuid: string;

  @OneToOne(
    () => JolocomWallet,
    wallet => wallet.organization,
  )
  jolocomWallet: JolocomWallet;

  @OneToMany(
    () => CredentialVerifyRequest,
    request => request.requestor,
  )
  verifyRequests: CredentialVerifyRequest[];

  @OneToMany(
    () => CredentialIssueRequest,
    request => request.requestor,
  )
  issueRequests: CredentialIssueRequest[];

  static randomSecret(): string {
    return randomBytes(JWT_SECRET_BITS).toString('hex');
  }
}
