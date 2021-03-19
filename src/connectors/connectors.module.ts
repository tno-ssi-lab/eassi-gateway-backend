import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConnectorsService } from './connectors.service';
import { GetConnectorPipe } from './get-connector.pipe';

import { IndyModule } from './indy/indy.module';
import { IndyService } from './indy/indy.service';
import { IrmaModule } from './irma/irma.module';
import { IrmaService } from './irma/irma.service';
import { JolocomModule } from './jolocom/jolocom.module';
import { JolocomService } from './jolocom/jolocom.service';

export const CONNECTOR_SERVICES = 'CONNECTOR_SERVICES';

@Module({
  imports: [JolocomModule, IrmaModule, IndyModule, TypeOrmModule.forFeature()],
  providers: [
    ConnectorsService,
    GetConnectorPipe,
    {
      provide: CONNECTOR_SERVICES,
      useFactory: (jolocom, irma, indy) => [jolocom, irma, indy],
      inject: [JolocomService, IrmaService, IndyService],
    },
  ],
  exports: [
    TypeOrmModule, // is this needed??
    ConnectorsService,
    GetConnectorPipe,
    JolocomModule,
    IrmaModule,
    IndyModule,
  ],
})
export class ConnectorsModule {}
