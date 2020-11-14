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
}
