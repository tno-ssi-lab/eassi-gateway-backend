import { randomBytes } from 'crypto';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

const INDY_INVITATION_IDENTIFIER_BYTES = 6;

@Entity()
export class IndyInvitation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  connectionId: string;

  @Column({ unique: true })
  identifier: string;

  @Column('simple-json')
  connectionResponse: IndyConnectionResponse;

  static randomIdentifier() {
    return randomBytes(INDY_INVITATION_IDENTIFIER_BYTES).toString('base64');
  }
}
