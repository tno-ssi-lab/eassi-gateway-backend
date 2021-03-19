import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BaseMetadata } from 'cred-types-jolocom-core/js/types';
import { CredentialType } from 'src/types/credential-type.entity';
import {
  CredentialRenderTypes,
  CredentialOfferRenderInfo,
  CredentialOfferMetadata,
} from '@jolocom/protocol-ts';

@Entity()
export class JolocomCredentialType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  type: string;

  @Column()
  name: string;

  @Column('simple-json')
  context: BaseMetadata['context'];

  @Column('simple-json')
  claimInterface: BaseMetadata['claimInterface'];

  @OneToMany(() => CredentialType, (type) => type.jolocomType)
  credentialTypes: CredentialType[];

  get schema(): BaseMetadata {
    return {
      type: ['Credential', this.type],
      name: this.name,
      context: this.context,
      claimInterface: this.claimInterface,
    };
  }

  get offerMetadata(): {
    renderInfo?: CredentialOfferRenderInfo;
    metadata?: CredentialOfferMetadata;
  } {
    return {
      renderInfo: {
        background: {
          color: '#ffffff',
        },
        text: {
          color: '#000000',
        },
        renderAs: CredentialRenderTypes.document,
      },
      metadata: {
        asynchronous: false,
      },
    };
  }
}
