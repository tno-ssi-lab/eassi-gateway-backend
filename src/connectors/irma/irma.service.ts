import { Injectable, NotImplementedException } from '@nestjs/common';
import { ConnectorService } from '../connector-service.interface';
import { Organization } from 'src/organizations/organization.entity';
import { CredentialIssueRequest } from 'src/requests/credential-issue-request.entity';
import { CredentialVerifyRequest } from 'src/requests/credential-verify-request.entity';
import { sign, verify } from 'jsonwebtoken';

import * as irmaCredentials from './irma-credentials.json';

type IrmaDisclosureConjunction = string[][][];

type IrmaAttribute = {
  rawvalue: string;
  value: {
    '': any;
    en?: any;
    nl?: any;
  };
  id: string;
  status: string;
  issueancetime: number;
};

type IrmaDisclosure = IrmaAttribute[][];

interface IrmaSessionResult {
  status: string;
  proofStatus: string;
  disclosed: IrmaDisclosure;
}

interface IrmaDisclosureRequest {
  '@context': 'https://irma.app/ld/request/disclosure/v2';
  disclose: IrmaDisclosureConjunction;
}

// TODO Move to config / env
const JWT_KEY = `-----BEGIN RSA PRIVATE KEY-----
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
-----END RSA PRIVATE KEY-----`;

const IRMASERVER_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA0AmPwCCs3ZCwI4ehYiTQ
JQkh3JJSh1BrbvRfq5ib2F9KqYRI+U/39KrQvpdLBHF7Kl/ZN/SREykn17PyzkXV
Thy0DaRci5l9K2LFQf0DYg+Tmt/+tf8EHFurD00uegTSDuLxDBDbwuVHnQfgBZol
WlM35+leRK4szrk5nd65ZzDbpy12sSpbP2EfhawoYpa/8ziR2SKcPn7ezBItJdFk
SWP+6fbWdrvoKgk1bR3vX4+nITs4K6A4r8pZwKLVl9TRH9sdzeyuZhCerfgNHQAq
dRYFl6Hs5prAbnDNOXWzCeqKdBI55TqVJ7S7VMlX5OZCDvpSjbq3I0p+Cpm/FSqW
GyZarTT8o1K2za/4FKJo7GwHuOJDp09BCPPHEiz5vzfypArPn725S/PnZPTCc3Be
r1gV6xT18rUd/Uu0A6JU0aTEHGEcmpiXraldN26Av+htS5CXdPFMejeQZojZITmV
Wd2eSX5VcGQTXybV/RhwBRGKdaJOctMWjEtFg4DCRHGFlKWmZjNLlEwMWEJNKI2J
bghRQplLqKtX7vUJvp8S1d9NC6gNFnlBNG393GuN8N/JRpxWq5metK5WqrGgpkET
7e/cwsR2JqcBdpdH/6SVbDAvIw2FoPz580V1JeqjRRNbh0XsHWME+NTNyQWLSG9d
CAkT1FVbDPaMs4US5ixQe7ECAwEAAQ==
-----END PUBLIC KEY-----`;

interface IrmaCredential {
  id: string;
}

@Injectable()
export class IrmaService implements ConnectorService {
  name = 'irma';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async registerOrganization(organization: Organization) {
    // We don't need to do anything for IRMA.
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canIssueCredentialRequest(request: CredentialIssueRequest) {
    // We cannot issue IRMA credentials right now.
    return false;
  }

  canVerifyCredentialRequest(request: CredentialVerifyRequest) {
    if (!request.type) {
      throw Error('Could not check type');
    }

    return !!request.type.irmaType;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handleIssueCredentialRequest(issueRequest: CredentialIssueRequest) {
    throw new NotImplementedException('Cannot issue IRMA credentials');
  }

  async handleVerifyCredentialRequest(verifyRequest: CredentialVerifyRequest) {
    return {
      jwt: this.getSignedDisclosureJwt(verifyRequest),
      server: process.env.IRMASERVER_URL,
    };
  }

  handleIrmaDisclosure(verifyRequest: CredentialVerifyRequest, jwt: string) {
    const publicKey = IRMASERVER_PUBLIC_KEY;

    const decoded = verify(jwt, publicKey, {
      issuer: 'irmaserver',
      subject: 'disclosing_result',
    });

    let result: IrmaSessionResult;

    if (typeof decoded !== 'object') {
      throw new Error('Could not properly decode JWT');
    } else {
      result = decoded as IrmaSessionResult;
    }

    if (result.status !== 'DONE') {
      throw new Error('Invalid session status');
    }

    if (result.proofStatus !== 'VALID') {
      throw new Error('Invalid proof status');
    }

    // TODO: Validate disclosed info satisfies credentialType type.

    return this.transformDisclosure(result.disclosed);
  }

  protected transformDisclosure(disclose: IrmaDisclosure) {
    const data = {};
    disclose.forEach(arr =>
      arr.forEach(attribute => {
        const keyParts = attribute.id.split('.');
        const key = keyParts[keyParts.length - 1];
        data[key] = attribute.rawvalue;
      }),
    );
    return data;
  }

  protected getSignedDisclosureJwt(
    verifyRequest: CredentialVerifyRequest,
  ): string {
    const disclosureRequest = this.getIrmaDisclosureRequest(verifyRequest);
    return this.signDisclosureSessionJwt(disclosureRequest);
  }

  protected getIrmaDisclosureRequest(
    verifyRequest: CredentialVerifyRequest,
  ): IrmaDisclosureRequest {
    const irmaCredentialId = verifyRequest.type.irmaType;
    const irmaCredential = irmaCredentials.find(c => c.id === irmaCredentialId);

    if (!irmaCredential) {
      throw new Error(
        `Could not find irma credential with id ${verifyRequest.type.irmaType}`,
      );
    }

    const attributes = irmaCredential.attributes as IrmaCredential[];

    return {
      '@context': 'https://irma.app/ld/request/disclosure/v2',
      disclose: [[attributes.map(({ id }) => `${irmaCredentialId}.${id}`)]],
    };
  }

  protected signDisclosureSessionJwt(
    disclosureRequest: IrmaDisclosureRequest,
  ): string {
    // TODO: Get from config
    const issuer = 'ssi-service-provider';
    const subject = 'verification_request';
    const key = JWT_KEY;

    return sign(
      { sprequest: { validity: 120, request: disclosureRequest } },
      key,
      {
        algorithm: 'RS256',
        issuer,
        subject,
      },
    );
  }
}
