import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Organization } from '../organizations/organization.entity';
import { JolocomCredentialType } from 'src/connectors/jolocom/jolocom-credential-type.entity';
import { CredentialVerifyRequest } from 'src/requests/credential-verify-request.entity';
import { CredentialIssueRequest } from 'src/requests/credential-issue-request.entity';
import { Type } from 'class-transformer';

@Entity()
export class CredentialType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Type(() => Organization)
  @ManyToOne(
    () => Organization,
    organization => organization.credentialTypes,
  )
  organization: Organization;

  @ManyToOne(
    () => JolocomCredentialType,
    credentialType => credentialType.credentialTypes,
    {
      nullable: true,
      eager: true,
    },
  )
  jolocomType: JolocomCredentialType;

  // TODO: Maybe use simplejson and make it an IrmaDisjunction?
  @Column({ nullable: true })
  irmaType: string;

  @OneToMany(
    () => CredentialVerifyRequest,
    request => request.type,
  )
  verifyRequests: CredentialVerifyRequest[];

  @OneToMany(
    () => CredentialIssueRequest,
    request => request.type,
  )
  issueRequests: CredentialIssueRequest[];
}
