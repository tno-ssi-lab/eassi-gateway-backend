import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  getServerBaseUrl(): string {
    return process.env.SSI_SERVER_URL || 'http://localhost:3000';
  }

  getIrmaUrl(): string {
    return process.env.IRMA_SERVER_URL || 'http://localhost:8989';
  }

  getUrl(path: string): string {
    return new URL(path, this.getServerBaseUrl()).toString();
  }

  getIndyUrl(): string {
    return process.env.ACAPY_ADMIN_URL || 'http://acapy:9001';
  }

  getIndyDID(): string {
    return process.env.ACAPY_INDY_DID || '';
  }

  getTrinsicUrl(): string {
    return process.env.TRINSIC_ADMIN_URL || 'https://api.trinsic.id';
  }

  getTrinsicAPIKey(): string {
    return process.env.TRINSIC_API_KEY || '';
  }

  getDatakeeperAPIUrl(): string {
    return process.env.DATAKEEPER_API_URL || '';
  }

  getDatakeeperAPIKey(): string {
    return process.env.DATAKEEPER_API_KEY || '';
  }

  getDatakeeperIssuerDID(): string {
    return process.env.DATAKEEPER_ISSUER_DID || '';
  }

  getDatakeeperPreProdApiDID(): string {
    return process.env.DATAKEEPER_PREPROD_API_DID || '';
  }

  getDatakeeperProdApiDID(): string {
    return process.env.DATAKEEPER_PROD_API_DID || '';
  }

  getWaltidUrl(): string {
    return process.env.WALTID_ADMIN_URL || 'https://signatory.ssikit.walt.id/api-routes';
  } // API for Signatory, Custodian and Auditor?

  getWaltidAPIKey(): string {
    return process.env.WALTID_API_KEY || '';
  }
}
