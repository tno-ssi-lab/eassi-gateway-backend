import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { randomBytes } from 'crypto';

export interface WaltidConnectionResponse {
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

  const WALTID_INVITATION_IDENTIFIER_BYTES = 6;

@Entity()
export class WaltidInvitation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
  
  @Column({ unique: true })
  connectionId: string;

  @Column()
  multiParty: boolean;

  @Column('simple-json')
  connectionResponse: WaltidConnectionResponse;

  static randomIdentifier() {
    return randomBytes(WALTID_INVITATION_IDENTIFIER_BYTES).toString('base64');
  }
}