import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  Inject,
} from '@nestjs/common';
import { ConnectorsService } from './connectors.service';

@Injectable()
export class GetConnectorPipe implements PipeTransform {
  constructor(
    @Inject(ConnectorsService) private connectorsService: ConnectorsService,
  ) {}

  transform(connectorName: string, metatdata: ArgumentMetadata) {
    const connector = this.connectorsService.getConnector(connectorName);
    if (!connector) {
      throw new Error(`No connector for "${connectorName}"`);
    }
    return connector;
  }
}
