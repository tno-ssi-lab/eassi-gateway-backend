import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Generated,
  ManyToOne,
} from 'typeorm';
import { CredentialRequest } from './credential-request.interface';
import { Organization } from '../organizations/organization.entity';

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

  @Column()
  type: string;

  @Column()
  @Generated('uuid')
  uuid: string;

  @Column('simple-json')
  data: CredentialData;

  @ManyToOne(
    () => Organization,
    organization => organization.issueRequests,
  )
  requestor: Organization;

  get requestId() {
    return `credential-issue-request:${this.uuid}`;
  }

  get issuer() {
    return this.requestor;
  }

  set issuer(issuer: Organization) {
    this.requestor = issuer;
  }
}
