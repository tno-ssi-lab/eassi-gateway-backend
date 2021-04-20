import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { CredentialVerifyRequest } from 'src/requests/credential-verify-request.entity';

@Entity()
@Index(['nonce', 'verifyRequest'], { unique: true })
export class IdaCredentialRequestToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nonce: string;

  @Column({ type: 'text' })
  token: string;

  @ManyToOne(
    () => CredentialVerifyRequest,
    vr => vr.jolocomTokens,
  )
  verifyRequest: CredentialVerifyRequest;
}
