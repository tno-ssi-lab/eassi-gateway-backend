import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

}
