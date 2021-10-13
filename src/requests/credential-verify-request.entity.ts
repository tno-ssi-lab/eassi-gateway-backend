import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Generated,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CredentialRequest } from './credential-request.interface';
import { Organization } from '../organizations/organization.entity';
import { CredentialType } from 'src/types/credential-type.entity';
import { CredentialPredicates } from './credential-verify-request-predicates.dto';
import { JolocomCredentialRequestToken } from 'src/connectors/jolocom/jolocom-credential-request-token.entity';
import { IdaCredentialRequestToken } from 'src/connectors/ida/ida-credential-request-token.entity';
import { Type } from 'class-transformer';
import { IndyInvitation } from 'src/connectors/indy/indy-invitation.entity';

export interface CredentialVerifyRequestData {
  jti: string;
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

  @ManyToOne(
    () => CredentialType,
    type => type.verifyRequests,
    {
      eager: true,
    },
  )
  type: CredentialType;

  @Column()
  @Generated('uuid')
  uuid: string;

  @Column("text", { array: true })
  attributes: string[];

  @Column('simple-json')
  predicates: CredentialPredicates;

  @Column()
  jwtId: string;

  @Column()
  hash: string;

  @Type(() => Organization)
  @ManyToOne(
    () => Organization,
    organization => organization.verifyRequests,
    {
      eager: true,
    },
  )
  requestor: Organization;

  @OneToMany(
    () => JolocomCredentialRequestToken,
    token => token.verifyRequest,
  )
  jolocomTokens: JolocomCredentialRequestToken[];

  @OneToMany(
    () => IdaCredentialRequestToken,
    token => token.verifyRequest,
  )
  idaTokens: IdaCredentialRequestToken[];


  static requestType: string;

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

// This was moved outside the class definition, because TypeScript didn't emit
// the property into JS.
CredentialVerifyRequest.requestType = 'credential-verify-request';
