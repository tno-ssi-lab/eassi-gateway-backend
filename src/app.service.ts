import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getServerBaseUrl(): string {
    return process.env.SSI_SERVER_URL || 'http://localhost:3000';
  }

  getIrmaUrl(): string {
    return process.env.IRMA_SERVER_URL || 'http://localhost:8989';
  }

  getUrl(path: string): string {
    return new URL(path, this.getServerBaseUrl()).toString();
  }
}
