import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { randomBytes } from 'crypto';

const JWT_SECRET_BITS = 32;

@Entity()
export class Organization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  sharedSecret: string;

  static randomSecret(): string {
    return randomBytes(JWT_SECRET_BITS).toString('hex');
  }
}
