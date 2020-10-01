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
import { CredentialType } from 'src/types/credential-type.entity';
import { Exclude, Expose, Type } from 'class-transformer';

const JWT_SECRET_BITS = 32;

@Exclude()
@Entity()
export class Organization {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @Column()
  name: string;

  @Column()
  sharedSecret: string;

  @Expose()
  @Column()
  @Generated('uuid')
  uuid: string;

  @OneToOne(
    () => JolocomWallet,
    wallet => wallet.organization,
    {
      eager: true,
    },
  )
  jolocomWallet: JolocomWallet;

  @Expose()
  @Type(() => CredentialType)
  @OneToMany(
    () => CredentialType,
    type => type.organization,
  )
  credentialTypes: CredentialType[];

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
