import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Generated,
  ManyToOne,
} from 'typeorm';
import { CredentialRequest } from './credential-request.interface';
import { Organization } from '../organizations/organization.entity';
import { CredentialType } from 'src/types/credential-type.entity';

interface CredentialData {
  [key: string]: string | number | boolean | null;
}

export interface CredentialIssueRequestData {
  iss: string;
  type: string;
  data: CredentialData;
  callbackUrl: string; // the REST api of the verifier where to deliver the credential data
}

@Entity()
export class CredentialIssueRequest implements CredentialRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  callbackUrl: string;

  @ManyToOne(
    () => CredentialType,
    type => type.issueRequests,
    {
      eager: true,
    },
  )
  type: CredentialType;

  @Column()
  @Generated('uuid')
  uuid: string;

  @Column('simple-json')
  data: CredentialData;

  @ManyToOne(
    () => Organization,
    organization => organization.issueRequests,
    {
      eager: true,
    },
  )
  requestor: Organization;

  static requestType: string;

  get requestId() {
    return `${CredentialIssueRequest.requestType}:${this.uuid}`;
  }

  get iss() {
    return this.requestor?.uuid;
  }

  get issuer() {
    return this.requestor;
  }

  set issuer(issuer: Organization) {
    this.requestor = issuer;
  }
}

// This was moved outside the class definition, because TypeScript didn't emit
// the property into JS.
CredentialIssueRequest.requestType = 'credential-issue-request';
