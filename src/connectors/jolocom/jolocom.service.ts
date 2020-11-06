import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as QRCode from 'qrcode';

import { JolocomLib } from 'jolocom-lib';
// import { JolocomRegistry } from 'jolocom-lib/js/registries/jolocomRegistry';
import { JSONWebToken } from 'jolocom-lib/js/interactionTokens/JSONWebToken';
import { CredentialOfferRequest as JolocomCredentialOfferRequest } from 'jolocom-lib/js/interactionTokens/credentialOfferRequest';
import { CredentialOfferResponse as JolocomCredentialOfferResponse } from 'jolocom-lib/js/interactionTokens/credentialOfferResponse';
import { CredentialsReceive as JolocomCredentialsReceive } from 'jolocom-lib/js/interactionTokens/credentialsReceive';
import { CredentialRequest as JolocomCredentialRequest } from 'jolocom-lib/js/interactionTokens/credentialRequest';
import { CredentialResponse as JolocomCredentialResponse } from 'jolocom-lib/js/interactionTokens/credentialResponse';

import { ConfigService } from 'src/config/config.service';
import { ConnectorService } from '../connector-service.interface';
import { Organization } from '../../organizations/organization.entity';
import { JolocomWallet } from './jolocom-wallet.entity';
import { JolocomCredentialType } from './jolocom-credential-type.entity';
import { CredentialIssueRequest } from 'src/requests/credential-issue-request.entity';
import { CredentialVerifyRequest } from 'src/requests/credential-verify-request.entity';
import { JolocomCredentialRequestToken } from './jolocom-credential-request-token.entity';
import { keyIdToDid } from 'jolocom-lib/js/utils/helper';
import { JolocomSDK, SDKError } from '@jolocom/sdk';

import * as util from 'util';
import { CredentialRequestFlowState } from '@jolocom/sdk/js/interactionManager/types';

// const DEFAULT_EXPIRY_MS = 60 * 60 * 1000;

function omitId<T>(obj: T): Omit<T, 'id'> {
  const newObj = {};

  Object.keys(obj)
    .filter(key => key !== 'id')
    .forEach(key => {
      newObj[key] = obj[key];
    });

  return newObj as Omit<T, 'id'>;
}

@Injectable()
export class JolocomService implements ConnectorService {
  name = 'jolocom';

  // private registry: JolocomRegistry;
  private logger: Logger;

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
    this.logger.log(util.inspect(this.jolocomSDK));
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

    this.logger.debug('Jolocom issue request token', token);

    return {
      qr: await QRCode.toDataURL(token),
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

    this.logger.debug('Jolocom verify request token', token);

    return {
      qr: await QRCode.toDataURL(token),
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
    const agent = await this.jolocomSDK.loadAgent(wallet.password, wallet.did);

    const interaction = await agent.processJWT(token);

    // const jolocomCredentialResponse = JolocomLib.parse.interactionToken.fromJWT<
    //   JolocomCredentialResponse
    // >(token);

    // if (!JolocomLib.util.validateDigestable(jolocomCredentialResponse)) {
    //   throw new Error('Invalid signature');
    // }

    // const identityWallet = await this.getIdentityWallet(
    //   verifyRequest.verifier.jolocomWallet,
    // );

    const jolocomToken = await this.tokenRepository.findOneOrFail({
      verifyRequest,
    });

    // const jolocomCredentialRequest: JSONWebToken<JolocomCredentialRequest> = JolocomLib.parse.interactionToken.fromJWT(
    //   jolocomToken.token,
    // );

    // The validate method will ensure the response contains a valid signature, is not expired,
    // lists our did in the aud (audience) section, and contains the same jti (nonce) as the request.
    // await identityWallet.validateJWT(
    //   jolocomCredentialResponse,
    //   jolocomCredentialRequest,
    // );

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

  /* JolocomService specific */

  /* JolocomCredentialType methods */

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

  protected async createWalletForOrganization(organization: Organization) {
    this.logger.debug(`Creating wallet for ${organization.name}`);
    // const seed = JolocomWallet.randomSeed();
    const password = JolocomWallet.randomPassword();
    // const keyProvider = JolocomLib.KeyProvider.fromSeed(seed, password);
    const agent = await this.jolocomSDK.createAgent(password, 'jolo');

    const wallet = new JolocomWallet();
    wallet.organization = organization;
    wallet.password = password;
    wallet.did = agent.identityWallet.did;
    // wallet.encryptedSeedHex = keyProvider.encryptedSeed; // Already in hex format

    await this.walletsRepository.save(wallet);
    this.logger.debug(`Created wallet for ${organization.name}`);
    return wallet;
  }

  protected async registerWallet(wallet: JolocomWallet) {
    this.logger.debug(`Wallet registration started`);
    const keyProvider = this.getKeyProvider(wallet);
    // await this.registry.create(keyProvider, wallet.password);
    this.logger.debug(`Wallet registration successful`);
  }

  protected async getIdentityWallet(wallet: JolocomWallet) {
    const keyProvider = this.getKeyProvider(wallet);
    // const identityWallet = await this.registry.authenticate(keyProvider, {
    //   derivationPath: JolocomLib.KeyTypes.jolocomIdentityKey,
    //   encryptionPass: wallet.password,
    // });
    // return identityWallet;
  }

  protected async fuelWallet(wallet: JolocomWallet) {
    this.logger.debug(`Wallet fueling started`);
    // const publicEthKey = this.getPublicEthKey(wallet);
    // await JolocomLib.util.fuelKeyWithEther(publicEthKey);
    this.logger.debug(`Wallet fueling started`);
  }

  protected getPublicEthKey(wallet: JolocomWallet) {
    const keyProvider = this.getKeyProvider(wallet);
    // return keyProvider.getPublicKey({
    //   encryptionPass: wallet.password,
    //   derivationPath: JolocomLib.KeyTypes.ethereumKey,
    // });
  }

  protected getKeyProvider(wallet: JolocomWallet) {
    // return new JolocomLib.KeyProvider(wallet.encryptedSeed);
  }

  /**
   * Construct a Jolocom CredentialOffer interaction token
   *
   * @param issueRequest the credential issue request
   */
  protected async createCredentialOfferToken(
    issueRequest: CredentialIssueRequest,
  ): Promise<string> {
    const issuer = issueRequest.issuer;
    const wallet = issuer.jolocomWallet;
    const jolocomType = issueRequest.type.jolocomType;
    const agent = await this.jolocomSDK.loadAgent(wallet.password, wallet.did);

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
  ): Promise<JSONWebToken<JolocomCredentialsReceive>> {
    const issuer = issueRequest.issuer;
    const wallet = issuer.jolocomWallet;
    const jolocomType = issueRequest.type.jolocomType;
    const agent = await this.jolocomSDK.loadAgent(wallet.password, wallet.did);

    const interaction = await agent.processJWT(jwt);

    const credential = await agent.signedCredential({
      metadata: jolocomType.schema,
      claim: {
        ...issueRequest.data,
      },
      subject: interaction.counterparty.did,
    });

    return interaction.createCredentialReceiveToken([credential]);
    // This should automatically issue the requested credentials.
    // return interaction.createCredentialReceiveToken();
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
    const agent = await this.jolocomSDK.loadAgent(wallet.password, wallet.did);

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

    const credentialRequestToken2 = await agent.identityWallet.create.interactionTokens.request.share(
      {
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
      },
      wallet.password,
    );

    this.logger.debug(credentialRequestToken2.encode());

    const token = new JolocomCredentialRequestToken();
    token.nonce = 'nonce'; // credentialRequestToken.nonce;
    token.verifyRequest = verifyRequest;
    token.token = credentialRequestToken;

    // // Save CredentialRequest because it is needed to verify a CredentialResponse token in the
    // // next step. See method receiveCredential() below
    await this.tokenRepository.save(token);

    return credentialRequestToken;
  }
}
