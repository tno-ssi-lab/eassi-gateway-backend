import { Module } from '@nestjs/common';

import { JolocomModule } from './jolocom/jolocom.module';
import { IrmaModule } from './irma/irma.module';
import { ConnectorsService } from './connectors.service';
import { GetConnectorPipe } from './get-connector.pipe';

@Module({
  imports: [JolocomModule, IrmaModule],
  providers: [ConnectorsService, GetConnectorPipe],
  exports: [ConnectorsService, GetConnectorPipe, JolocomModule, IrmaModule],
})
export class ConnectorsModule {}
