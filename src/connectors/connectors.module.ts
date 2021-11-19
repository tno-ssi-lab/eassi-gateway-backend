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
import { TrinsicModule } from './trinsic/trinsic.module';
import { TrinsicService } from './trinsic/trinsic.service';

export const CONNECTOR_SERVICES = 'CONNECTOR_SERVICES';

@Module({
  imports: [JolocomModule, IdaModule, IrmaModule, IndyModule, TrinsicModule, TypeOrmModule.forFeature()],
  providers: [
    ConnectorsService,
    GetConnectorPipe,
    {
      provide: CONNECTOR_SERVICES,
      useFactory: (jolocom, ida, irma, indy, trinsic) => [jolocom, ida, irma, indy, trinsic],
      inject: [JolocomService, IdaService, IrmaService, IndyService, TrinsicService],
    },
  ],
  exports: [
    TypeOrmModule, // is this needed??
    ConnectorsService,
    GetConnectorPipe,
    JolocomModule,
    IdaModule,
    IrmaModule,
    IndyModule,
    TrinsicModule,
  ],
})
export class ConnectorsModule {}
