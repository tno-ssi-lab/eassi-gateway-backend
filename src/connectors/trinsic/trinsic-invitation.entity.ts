import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { randomBytes } from 'crypto';

export interface TrinsicConnectionResponse {
    connectionId: string;
    name: string;
    imageUrl: string;   
    myDid: string;   
    theirDid: string;
    myKey: string;
    theirKey: string;
    state: string;
    invitation: string;
    invitationUrl: string;
    endpoint: {   
        did: string;
        reciverkeypientKeys: string[];
        uri: string;
      };
    createdAtUtc: string;
    multiParty: boolean;
  }

  const TRINSIC_INVITATION_IDENTIFIER_BYTES = 6;

@Entity()
export class TrinsicInvitation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
  
  @Column({ unique: true })
  connectionId: string;

  @Column()
  multiParty: boolean;

  @Column('simple-json')
  connectionResponse: TrinsicConnectionResponse;

  static randomIdentifier() {
    return randomBytes(TRINSIC_INVITATION_IDENTIFIER_BYTES).toString('base64');
  }
}
