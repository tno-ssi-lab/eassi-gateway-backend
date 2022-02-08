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

  getTrinsicUrl(): string {
    return process.env.TRINSIC_ADMIN_URL || 'https://api.trinsic.id';
  }

  getIndyDID(): string {
    return process.env.ACAPY_INDY_DID || '';
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
}
