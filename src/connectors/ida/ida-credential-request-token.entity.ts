import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { CredentialVerifyRequest } from 'src/requests/credential-verify-request.entity';

@Entity()
@Index(['transactionId', 'verifyRequest'], { unique: true })
export class IdaCredentialRequestToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  transactionId: string;

  @ManyToOne(
    () => CredentialVerifyRequest,
    vr => vr.jolocomTokens,
  )
  verifyRequest: CredentialVerifyRequest;
}
