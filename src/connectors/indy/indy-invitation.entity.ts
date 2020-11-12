import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { CredentialVerifyRequest } from 'src/requests/credential-verify-request.entity';

export interface IndyConnectionResponse {
  connection_id: string;
  invitation: {
    '@type': 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/invitation';
    '@id': string;
    recipientKeys: string[];
    serviceEndpoint: string;
    label: string;
  };
  invitation_url: string;
  alias: string;
}

@Entity()
@Index(['verifyRequest'], { unique: true })
export class IndyInvitation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  connectionId: string;

  @Column('simple-json')
  connectionResponse: IndyConnectionResponse;

  @ManyToOne(
    () => CredentialVerifyRequest,
    vr => vr.jolocomTokens,
  )
  verifyRequest: CredentialVerifyRequest;
}
