import { Module } from '@nestjs/common';

import { JolocomModule } from './jolocom/jolocom.module';
import { IrmaModule } from './irma/irma.module';
import { ConnectorsService } from './connectors.service';
import { GetConnectorPipe } from './get-connector.pipe';
import { IndyModule } from './indy/indy.module';

@Module({
  imports: [JolocomModule, IrmaModule, IndyModule],
  providers: [ConnectorsService, GetConnectorPipe],
  exports: [
    ConnectorsService,
    GetConnectorPipe,
    JolocomModule,
    IrmaModule,
    IndyModule,
  ],
})
export class ConnectorsModule {}
