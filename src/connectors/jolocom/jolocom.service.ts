import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as QRCode from 'qrcode';
import { Agent, JolocomSDK } from '@jolocom/sdk';

import { ConfigService } from 'src/config/config.service';
import { ConnectorService } from '../connector-service.interface';
import { Organization } from '../../organizations/organization.entity';
import { JolocomWallet } from './jolocom-wallet.entity';
import { JolocomCredentialType } from './jolocom-credential-type.entity';
import { CredentialIssueRequest } from 'src/requests/credential-issue-request.entity';
import { CredentialVerifyRequest } from 'src/requests/credential-verify-request.entity';
import { JolocomCredentialRequestToken } from './jolocom-credential-request-token.entity';

import * as util from 'util';
import { CredentialRequestFlowState } from '@jolocom/sdk/js/interactionManager/types';

// const DEFAULT_EXPIRY_MS = 60 * 60 * 1000;

function omitId<T>(obj: T): Omit<T, 'id'> {
  const newObj = {};

  Object.keys(obj)
    .filter((key) => key !== 'id')
    .forEach((key) => {
      newObj[key] = obj[key];
    });

  return newObj as Omit<T, 'id'>;
}

@Injectable()
export class JolocomService implements ConnectorService {
  name = 'jolocom';

  // private registry: JolocomRegistry;
  private logger: Logger;
  // An agent cache in needed because the current version of the JolocomSDK
  // doesn't support continuing interactions in a 'fresh' agent. This will
  // change in the future.
  private agentCache: { [did: string]: Agent };

  constructor(
    @InjectRepository(JolocomWallet)
    private walletsRepository: Repository<JolocomWallet>,
    @InjectRepository(JolocomCredentialType)
    private typesRepository: Repository<JolocomCredentialType>,
    @InjectRepository(JolocomCredentialRequestToken)
    private tokenRepository: Repository<JolocomCredentialRequestToken>,
    private configService: ConfigService,
    private jolocomSDK: JolocomSDK,
  ) {
    // this.registry = JolocomLib.registries.jolocom.create();
    this.logger = new Logger(JolocomService.name);
    this.agentCache = {};
  }

  /* ConnectorService methods */

  async registerOrganization(organization: Organization) {
    await this.createWalletForOrganization(organization);
    // await this.fuelWallet(wallet);
    // await this.registerWallet(wallet);
  }

  canIssueCredentialRequest(request: CredentialIssueRequest) {
    if (!request.type) {
      throw Error('Could not check type');
    }

    return !!request.type.jolocomType;
  }

  canVerifyCredentialRequest(request: CredentialVerifyRequest) {
    if (!request.type) {
      throw Error('Could not check type');
    }

    return !!request.type.jolocomType;
  }

  async handleIssueCredentialRequest(request: CredentialIssueRequest) {
    const token = await this.createCredentialOfferToken(request);

    this.logger.debug(`Jolocom issue request token ${token.encode()}`);

    return {
      qr: await QRCode.toDataURL(token.encode()),
    };
  }

  async handleIssueCredential(request: CredentialIssueRequest, jwt: string) {
    const response = await this.createCredentialReceiveToken(request, jwt);
    const token = response.encode();

    this.logger.debug('Jolocom issue token', token);

    return { token };
  }

  async handleVerifyCredentialRequest(request: CredentialVerifyRequest) {
    const token = await this.createCredentialRequestToken(request);

    this.logger.debug(`Jolocom verify request token ${token.encode()}`);

    return {
      qr: await QRCode.toDataURL(token.encode()),
    };
  }

  public async handleVerifyCredentialDisclosure(
    verifyRequest: CredentialVerifyRequest,
    body: { token: string },
  ): Promise<any> {
    const { token } = body;
    this.logger.debug('Jolocom disclosure token', token);

    const verifier = verifyRequest.verifier;
    const wallet = verifier.jolocomWallet;
    const jolocomType = verifyRequest.type.jolocomType;
    const agent = await this.loadAgent(wallet);

    const interaction = await agent.processJWT(token);

    const jolocomToken = await this.tokenRepository.findOneOrFail({
      verifyRequest,
    });

    // const credentialResponse = jolocomCredentialResponse.interactionToken;

    // We check against the request we created in a previous step
    // const validResponse = credentialResponse.satisfiesRequest(
    //   jolocomCredentialRequest.interactionToken,
    // );

    // if (!validResponse) {
    //   throw new Error('Incorrect credential received');
    // }

    // this.logger.debug(JSON.stringify(credentialResponse));

    this.logger.log(util.inspect(interaction));
    this.logger.log(util.inspect(interaction.flow.getState()));

    const state = interaction.flow.getState() as CredentialRequestFlowState;

    // Validate the provided credentials
    const providedCredentials = state.providedCredentials;

    this.logger.log(util.inspect(providedCredentials));

    // const signatureValidationResults = await JolocomLib.util.validateDigestables(
    //   providedCredentials,
    // );

    // if (signatureValidationResults.every(result => result === true)) {
    //   let data = {};

    //   providedCredentials.forEach(credential => {
    //     data = {
    //       ...data,
    //       ...omitId(credential.claim),
    //     };
    //   });

    //   this.logger.debug('Got data');
    //   this.logger.debug(JSON.stringify(data));

    //   // Handle the data in the provided credentials
    //   return data;
    // } else {
    //   throw new Error('Not all provided credentials are valid');
    // }
  }

  async findAllTypes() {
    return this.typesRepository.find();
  }

  async createType(typeData: Partial<JolocomCredentialType>) {
    const type = new JolocomCredentialType();
    type.type = typeData.type;
    type.name = typeData.name;
    type.claimInterface = typeData.claimInterface;
    type.context = typeData.context;

    return this.typesRepository.save(type);
  }

  async getWalletPubkey(organization: Organization) {
    const agent = await this.loadAgent(organization.jolocomWallet);
    const pubKey = await agent.keyProvider.getPubKeyByController(
      organization.jolocomWallet.password,
      `${agent.keyProvider.id}#keys-2`,
    );

    return `0x${pubKey}`;
  }

  async redeployDDO(organization: Organization) {
    const agent = await this.loadAgent(organization.jolocomWallet);
    const jolo = this.jolocomSDK.didMethods.get('jolo');
    return jolo.registrar.create(
      agent.keyProvider,
      organization.jolocomWallet.password,
    );
  }

  protected async createWalletForOrganization(organization: Organization) {
    this.logger.debug(`Creating wallet for ${organization.name}`);
    const wallet = new JolocomWallet();
    wallet.organization = organization;
    wallet.password = JolocomWallet.randomPassword();

    await this.createAgent(wallet);
    await this.walletsRepository.save(wallet);

    this.logger.debug(`Created wallet for ${organization.name}`);
    return wallet;
  }

  /**
   * Construct a Jolocom CredentialOffer interaction token
   *
   * @param issueRequest the credential issue request
   */
  protected async createCredentialOfferToken(
    issueRequest: CredentialIssueRequest,
  ) {
    const issuer = issueRequest.issuer;
    const wallet = issuer.jolocomWallet;
    const jolocomType = issueRequest.type.jolocomType;
    const agent = await this.loadAgent(wallet);

    return agent.credOfferToken({
      callbackURL: this.configService.getUrl(
        `/api/issue/jolocom/receive?issueRequestId=${issueRequest.requestId}`,
      ),
      offeredCredentials: [
        {
          type: jolocomType.type,
          ...jolocomType.offerMetadata,
          // ...jolocomType.offerMetadata,
        },
      ],
    });
  }

  /**
   * Construct a Jolocom CredentialReceive interaction token
   * to actual issue the credential to the user's wallet app
   *
   * @param issueRequest the credential issue request
   * @param jolocomOfferResponse the Jolocom CredentialOfferResponse that is received from the user's wallet app
   */
  public async createCredentialReceiveToken(
    issueRequest: CredentialIssueRequest,
    jwt: string,
  ) {
    const issuer = issueRequest.issuer;
    const wallet = issuer.jolocomWallet;
    const jolocomType = issueRequest.type.jolocomType;
    const agent = await this.loadAgent(wallet);

    const interaction = await agent.processJWT(jwt);

    const credential = await agent.signedCredential({
      metadata: jolocomType.schema,
      claim: {
        ...issueRequest.data,
      },
      subject: interaction.counterparty.did,
    });

    return interaction.createCredentialReceiveToken([credential]);
  }

  /**
   * Construct a Jolocom CredentialRequest interaction token
   *
   * @param verifyRequest the credential verify request
   */
  protected async createCredentialRequestToken(
    verifyRequest: CredentialVerifyRequest,
  ) {
    const verifier = verifyRequest.verifier;
    const wallet = verifier.jolocomWallet;
    const agent = await this.loadAgent(wallet);

    const jolocomType = verifyRequest.type.jolocomType;

    const credentialRequestToken = await agent.credRequestToken({
      // expires: new Date(Date.now() + DEFAULT_EXPIRY_MS), // FIXME Is this necessary?
      callbackURL: this.configService.getUrl(
        `/api/verify/jolocom/disclose?verifyRequestId=${verifyRequest.requestId}`,
      ),
      credentialRequirements: [
        {
          type: ['Credential', jolocomType.type],
          constraints: [
            // TODO: implement check on allowed issuers
            // constraintFunctions.is(
            //   "issuer",
            //   "did:jolo:ed19430d6e28057194870dc9b19c1ca2ad099ff090b52350add129f1049bb65d"
            // )
          ],
        },
      ],
    });

    const token = new JolocomCredentialRequestToken();
    token.nonce = credentialRequestToken.nonce;
    token.verifyRequest = verifyRequest;
    token.token = credentialRequestToken.encode();

    // Save CredentialRequest because it is needed to verify a CredentialResponse token in the
    // next step. See method handleVerifyCredentialDisclosure().
    await this.tokenRepository.save(token);

    return credentialRequestToken;
  }

  protected async createAgent(wallet: JolocomWallet) {
    const agent = await this.jolocomSDK.createAgent(wallet.password, 'jolo');
    this.agentCache[agent.identityWallet.did] = agent;
    wallet.did = agent.identityWallet.did;
    this.logger.debug(`Created agent ${wallet.did}`);
    return wallet;
  }

  protected async loadAgent(wallet: JolocomWallet) {
    if (!this.agentCache[wallet.did]) {
      this.logger.debug(`Loading agent from storage ${wallet.did}`);
      const agent = await this.jolocomSDK.loadAgent(
        wallet.password,
        wallet.did,
      );
      this.agentCache[wallet.did] = agent;
    } else {
      this.logger.debug(`Using existing agent ${wallet.did}`);
    }
    return this.agentCache[wallet.did];
  }
}
