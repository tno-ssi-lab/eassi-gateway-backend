import { Injectable, Logger } from '@nestjs/common';
import { JolocomLib } from 'jolocom-lib';
import { JolocomRegistry } from 'jolocom-lib/js/registries/jolocomRegistry';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ConnectorService } from '../connector-service.interface';
import { Organization } from '../../organizations/organization.entity';
import { JolocomWallet } from './jolocom-wallet.entity';
import { JolocomCredentialType } from './jolocom-credential-type.entity';

@Injectable()
export class JolocomService implements ConnectorService {
  type = 'jolocom';

  private registry: JolocomRegistry;
  private logger: Logger;

  constructor(
    @InjectRepository(JolocomWallet)
    private walletRepository: Repository<JolocomWallet>,
  ) {
    this.registry = JolocomLib.registries.jolocom.create();
    this.logger = new Logger(JolocomService.name);
  }

  /* ConnectorService methods */

  async registerOrganization(organization: Organization) {
    const wallet = await this.createWalletForOrganization(organization);
    await this.fuelWallet(wallet);
    await this.registerWallet(wallet);
  }

  /* JolocomService specific */

  async createWalletForOrganization(organization: Organization) {
    this.logger.debug(`Creating wallet for ${organization.name}`);
    const seed = JolocomWallet.randomSeed();
    const password = JolocomWallet.randomPassword();
    const keyProvider = JolocomLib.KeyProvider.fromSeed(seed, password);

    const wallet = new JolocomWallet();
    wallet.organization = organization;
    wallet.password = password;
    wallet.encryptedSeedHex = keyProvider.encryptedSeed; // Already in hex format

    await this.walletRepository.save(wallet);
    this.logger.debug(`Created wallet for ${organization.name}`);
    return wallet;
  }

  async registerWallet(wallet: JolocomWallet) {
    this.logger.debug(`Wallet registration started`);
    const keyProvider = this.getKeyProvider(wallet);
    const identityWallet = await this.registry.create(
      keyProvider,
      wallet.password,
    );
    this.logger.debug(`Wallet registration successful`);

    // TODO: Maybe we shouldn't return here.
    return identityWallet;
  }

  async getIdentityWallet(wallet: JolocomWallet) {
    const keyProvider = this.getKeyProvider(wallet);
    const identityWallet = await this.registry.authenticate(keyProvider, {
      derivationPath: JolocomLib.KeyTypes.jolocomIdentityKey,
      encryptionPass: wallet.password,
    });
    return identityWallet;
  }

  async fuelWallet(wallet: JolocomWallet) {
    this.logger.debug(`Wallet fueling started`);
    const publicEthKey = this.getPublicEthKey(wallet);
    await JolocomLib.util.fuelKeyWithEther(publicEthKey);
    this.logger.debug(`Wallet fueling started`);
  }

  getPublicEthKey(wallet: JolocomWallet) {
    const keyProvider = this.getKeyProvider(wallet);
    return keyProvider.getPublicKey({
      encryptionPass: wallet.password,
      derivationPath: JolocomLib.KeyTypes.ethereumKey,
    });
  }

  getKeyProvider(wallet: JolocomWallet) {
    return new JolocomLib.KeyProvider(wallet.encryptedSeed);
  }

  /* Jolocom specific */
  // public async processCredentialIssueRequest(
  //   request: CredentialIssueRequest,
  //   response: Response,
  // ): Promise<void> {
  //   const credOffer = await this.createCredentialOfferToken(request);
  //   const token = credOffer.encode();

  //   const viewData = {
  //     requestId: request.requestId,
  //     qr: await QRCode.toDataURL(token),
  //   };
  //   console.debug('Jolocom CredentialOfferToken: ', credOffer.encode());

  //   return response.render('jolocom/issue', viewData);
  // }

  // public async processCredentialVerifyRequest(
  //   verifyRequest: CredentialVerifyRequest,
  //   response: Response,
  // ): Promise<void> {
  //   // Create Jolocom interaction token
  //   const credRequestToken = await this.createCredentialRequestToken(
  //     verifyRequest,
  //   );

  //   const jwt = credRequestToken.encode();

  //   // Render interaction token (qr code) to user
  //   const viewData = {
  //     requestId: verifyRequest.requestId,
  //     qr: await QRCode.toDataURL(jwt),
  //   };

  //   return response.render('jolocom/verify', viewData);
  // }

  /**
   * Instantiate a Jolocom IdentityWallet
   * This wallet must already be registered on Etherium
   *
   * @param organization the organization for which an identifity wallet is instantiated
   */
  // protected async getIdentityWallet(
  //   organization: Organization,
  // ): Promise<IdentityWallet> {
  //   const password = organization.walletConfigs.jolocom!.password;
  //   const seed = Buffer.from(organization.walletConfigs.jolocom!.seed, 'hex');

  //   /**
  //    * From Jolocom Documentation:
  //    * You will need to instantiate a Key Provider using the seed used for identity creation
  //    * We are currently working on simplifying, and optimising this part of the api
  //    */
  //   const vaultedKeyProvider = JolocomLib.KeyProvider.fromSeed(seed, password);
  //   const registry = JolocomLib.registries.jolocom.create();

  //   return await registry.authenticate(vaultedKeyProvider, {
  //     derivationPath: JolocomLib.KeyTypes.jolocomIdentityKey,
  //     encryptionPass: password,
  //   });
  // }

  // /**
  //  * Construct a Jolocom CredentialOffer interaction token
  //  *
  //  * @param issueRequest the credential issue request
  //  */
  // protected async createCredentialOfferToken(
  //   issueRequest: CredentialIssueRequest,
  // ): Promise<JSONWebToken<CredentialOfferRequest>> {
  //   const issuer = issueRequest.getIssuer();
  //   const identityWallet = await this.getIdentityWallet(issuer);
  //   const { credentialOffers, password } = issuer.walletConfigs.jolocom!;

  //   // Get the Jolocom offeredType and metadata from configured list with credential offers
  //   const {
  //     schema: { type: offeredType },
  //     metadata = {},
  //   } = credentialOffers[issueRequest.credentialType]; // Use the credential type URI as defined in the CredentialIssueRequest

  //   // Return a Jolocom CredentialOffert interaction token
  //   return await identityWallet.create.interactionTokens.request.offer(
  //     {
  //       callbackURL: SSIServiceApp.getUrl(
  //         `/connectors/jolocom/issue/${issueRequest.requestId}`,
  //       ),
  //       offeredCredentials: [
  //         {
  //           type: offeredType[offeredType.length - 1],
  //           ...metadata,
  //         },
  //       ],
  //     },
  //     password,
  //   );
  // }

  // /**
  //  * Construct a Jolocom CredentialReceive interaction token
  //  * to actual issue the credential to the user's wallet app
  //  *
  //  * @param issueRequest the credential issue request
  //  * @param jolocomOfferResponse the Jolocom CredentialOfferResponse that is received from the user's wallet app
  //  */
  // public async createCredential(
  //   issueRequest: CredentialIssueRequest,
  //   jolocomOfferResponse: JSONWebToken<JWTEncodable>,
  // ): Promise<JSONWebToken<JWTEncodable>> {
  //   const issuer = issueRequest.getIssuer(); // the organization that wants to issue a credential
  //   const identityWallet = await this.getIdentityWallet(issuer); // jolocom identity wallet of the issuer
  //   const password = issuer.walletConfigs.jolocom!.password; // password to sign credential
  //   const subject = jolocomOfferResponse.issuer; // the wallet app that wants to receive a credential
  //   const credentialType = issuer.walletConfigs.jolocom!.credentialOffers[
  //     issueRequest.credentialType
  //   ];

  //   // Create actual credential (with data)
  //   const credential = await identityWallet.create.signedCredential(
  //     {
  //       metadata: credentialType.schema,
  //       claim: {
  //         ...issueRequest.credentialData,
  //       },
  //       subject: keyIdToDid(subject),
  //     },
  //     password,
  //   );

  //   // Wrap credential in Jolocom interaction token object
  //   return await identityWallet.create.interactionTokens.response.issue(
  //     {
  //       signedCredentials: [credential.toJSON()],
  //     },
  //     password,
  //     jolocomOfferResponse,
  //   );
  // }

  // /**
  //  * Construct a Jolocom CredentialRequest interaction token
  //  *
  //  * @param verifyRequest the credential verify request
  //  */
  // protected async createCredentialRequestToken(
  //   verifyRequest: CredentialVerifyRequest,
  // ): Promise<JSONWebToken<CredentialRequest>> {
  //   const verifier = verifyRequest.getVerifier();
  //   const identityWallet = await this.getIdentityWallet(verifier);
  //   const password = verifier.walletConfigs.jolocom!.password;
  //   const credentialRequestToken = await identityWallet.create.interactionTokens.request.share(
  //     {
  //       callbackURL: SSIServiceApp.getUrl(
  //         `/connectors/jolocom/verify/${verifyRequest.requestId}`,
  //       ),
  //       credentialRequirements: [
  //         {
  //           type: ['Credential', verifyRequest.credentialType],
  //           constraints: [
  //             // TODO: implement check on allowed issuers
  //             // constraintFunctions.is(
  //             //   "issuer",
  //             //   "did:jolo:ed19430d6e28057194870dc9b19c1ca2ad099ff090b52350add129f1049bb65d"
  //             // )
  //           ],
  //         },
  //       ],
  //     },
  //     password,
  //   );

  //   // Save CredentialRequest because it is needed to verify a CredentialResponse token in the
  //   // next step. See method receiveCredential() below
  //   Store.set(credentialRequestToken.nonce, credentialRequestToken.encode());

  //   return credentialRequestToken;
  // }

  // public async receiveCredential(
  //   verifyRequest: CredentialVerifyRequest,
  //   token: string,
  // ): Promise<any> {
  //   const jolocomCredentialResponse = JolocomLib.parse.interactionToken.fromJWT(
  //     token,
  //   );

  //   // TODO: check if this is needed here or can be done in JolocomConnector.receiveCredential() method
  //   if (!JolocomLib.util.validateDigestable(jolocomCredentialResponse)) {
  //     throw new Error('Invalid signature');
  //     // res.status(401).send("Invalid signature on interaction token");
  //   }

  //   const identityWallet = await this.getIdentityWallet(
  //     verifyRequest.getVerifier(),
  //   );

  //   // Get the CredentialShareToken (issued in previous interaction step)
  //   const jolocomCredentialRequestJWT: string = Store.get(
  //     jolocomCredentialResponse.nonce,
  //   );

  //   const jolocomCredentialRequest: JSONWebToken<CredentialRequest> = JolocomLib.parse.interactionToken.fromJWT(
  //     jolocomCredentialRequestJWT,
  //   );

  //   // The validate method will ensure the response contains a valid signature, is not expired,
  //   // lists our did in the aud (audience) section, and contains the same jti (nonce) as the request.
  //   // TODO: move this to route middleware
  //   await identityWallet.validateJWT(
  //     jolocomCredentialResponse,
  //     jolocomCredentialRequest,
  //   );

  //   const credentialResponse = jolocomCredentialResponse.interactionToken as CredentialResponse;

  //   // We check against the request we created in a previous step
  //   const validResponse = credentialResponse.satisfiesRequest(
  //     jolocomCredentialRequest.interactionToken,
  //   );

  //   if (!validResponse) {
  //     throw new Error('Incorrect credential received');
  //   }

  //   // Validate the provided credentials
  //   const providedCredentials = credentialResponse.suppliedCredentials;
  //   const signatureValidationResults = await JolocomLib.util.validateDigestables(
  //     providedCredentials,
  //   );

  //   if (signatureValidationResults.every(result => result === true)) {
  //     // The credentials can be used
  //     const data = providedCredentials.map(credential => credential.toJSON());

  //     // Handle the data in the provided credentials
  //     return verifyRequest.processCredentialData(data);
  //   } else {
  //     throw new Error('Not all provided credentials are valid');
  //   }
  // }
}
