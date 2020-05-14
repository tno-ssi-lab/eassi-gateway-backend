import { Organization } from 'src/organizations/organization.entity';

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

  // registerRoutes(root: string, app: Express): void;

  // processCredentialIssueRequest(request: CredentialIssueRequest): Promise<void>;

  // processCredentialVerifyRequest(
  //   request: CredentialVerifyRequest,
  // ): Promise<void>;
}
