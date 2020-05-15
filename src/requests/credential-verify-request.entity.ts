import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Generated,
  ManyToOne,
} from 'typeorm';
import { CredentialRequest } from './credential-request.interface';
import { Organization } from '../organizations/organization.entity';

export interface CredentialVerifyRequestData {
  iss: string;
  type: string;
  callbackUrl: string; // the REST api of the verifier where to deliver the credential data
}

@Entity()
export class CredentialVerifyRequest implements CredentialRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  callbackUrl: string;

  @Column()
  type: string;

  @Column()
  @Generated('uuid')
  uuid: string;

  @ManyToOne(
    () => Organization,
    organization => organization.verifyRequests,
  )
  requestor: Organization;

  static requestType: 'credential-verify-request';

  get requestId() {
    return `${CredentialVerifyRequest.requestType}:${this.uuid}`;
  }

  get iss() {
    return this.requestor?.uuid;
  }

  get verifier() {
    return this.requestor;
  }

  set verifier(verifier: Organization) {
    this.requestor = verifier;
  }
}
