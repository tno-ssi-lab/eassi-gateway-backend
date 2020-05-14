import uuidv4 from 'uuid/v4';

interface CredentialData {
  [key: string]: string | number | boolean | null;
}

export interface CredentialIssueRequestData {
  iss: string;
  type: string;
  data: CredentialData;
  callbackUrl: string; // the REST api of the verifier where to deliver the credential data
}

export class CredentialIssueRequest {
  requestId: string;

  constructor(
    protected issuerId: string,
    public credentialType: string,
    public credentialData: CredentialData,
    public callbackUrl: string,
  ) {
    this.requestId = `credential-issue-request-${uuidv4()}`;
  }
}
