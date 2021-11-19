import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConnectorsService } from './connectors.service';
import { GetConnectorPipe } from './get-connector.pipe';

import { IdaModule } from './ida/ida.module';
import { IdaService } from './ida/ida.service';
import { IndyModule } from './indy/indy.module';
import { IndyService } from './indy/indy.service';
import { IrmaModule } from './irma/irma.module';
import { IrmaService } from './irma/irma.service';
import { JolocomModule } from './jolocom/jolocom.module';
import { JolocomService } from './jolocom/jolocom.service';
import { GatacaModule } from './gataca/gataca.module';
import { GatacaService } from './gataca/gataca.service';

export const CONNECTOR_SERVICES = 'CONNECTOR_SERVICES';

@Module({
  imports: [
    JolocomModule,
    IdaModule,
    IrmaModule,
    IndyModule,
    GatacaModule,
    TypeOrmModule.forFeature(),
  ],
  providers: [
    ConnectorsService,
    GetConnectorPipe,
    {
      provide: CONNECTOR_SERVICES,
      useFactory: (...connectors) => connectors,
      inject: [
        JolocomService,
        IdaService,
        IrmaService,
        IndyService,
        GatacaService,
      ],
    },
  ],
  exports: [
    TypeOrmModule,
    ConnectorsService,
    GetConnectorPipe,
    JolocomModule,
    IdaModule,
    IrmaModule,
    IndyModule,
    GatacaModule,
  ],
})
export class ConnectorsModule {}
