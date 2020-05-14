import { Module } from '@nestjs/common';

import { JolocomModule } from './jolocom/jolocom.module';
import { IrmaModule } from './irma/irma.module';
import { ConnectorsService } from './connectors.service';

@Module({
  imports: [JolocomModule, IrmaModule],
  providers: [ConnectorsService],
  exports: [ConnectorsService],
})
export class ConnectorsModule {}
