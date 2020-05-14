import uuidv4 from 'uuid/v4';

export interface CredentialVerifyRequestData {
  iss: string;
  type: string;
  callbackUrl: string; // the REST api of the verifier where to deliver the credential data
}

export class CredentialVerifyRequest {
  requestId: string;

  constructor(
    protected verifierId: string,
    public credentialType: string,
    public callbackUrl: string,
  ) {
    this.requestId = `credential-verify-request-${uuidv4()}`;
  }
}
