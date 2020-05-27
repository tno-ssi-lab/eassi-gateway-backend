import { Organization } from 'src/organizations/organization.entity';
import { CredentialIssueRequest } from 'src/requests/credential-issue-request.entity';
import { CredentialVerifyRequest } from 'src/requests/credential-verify-request.entity';

/**
 * Interface describing a Connector that can be used by the SSI-service
 * e.g. connectors for Jolocom, IRMA, ...
 */
export interface ConnectorService {
  type: string;
  /**
   * Method for registering an organisation to use a certain SSI implementation
   * E.g. for Jolocom a self-sovereign identity must be created and anchored on Ethereum (see: https://jolocom-lib.readthedocs.io/en/latest/gettingStarted.html#how-to-create-a-self-sovereign-identity)
   * Other implementations might require other initialization steps
   */
  registerOrganization(org: Organization): Promise<void>;

  /**
   * Check if the connector can issue a credential for this request.
   */
  canIssueCredentialRequest(
    request: CredentialIssueRequest,
  ): Promise<boolean> | boolean;

  /**
   * Check if the connector can verify a credential for this request.
   */
  canVerifyCredentialRequest(
    request: CredentialVerifyRequest,
  ): Promise<boolean> | boolean;

  /**
   * Handle fullfillment of a issue request. This method should perform the
   * proper setup for actually issueing credentials to the wallet app for this
   * connector.
   *
   * @returns All data needed for the front-end to set up a issuing session.
   */
  handleIssueCredentialRequest(request: CredentialIssueRequest): Promise<any>;

  /**
   * Handle fullfillment of a verify request. This method should perform the
   * proper setup for actually verifying credentials to the wallet app for this
   * connector.
   *
   * @returns All data needed for the front-end to set up a verifying session.
   */
  handleVerifyCredentialRequest(request: CredentialVerifyRequest): Promise<any>;
}
