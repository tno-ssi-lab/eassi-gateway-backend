import { Test, TestingModule } from '@nestjs/testing';
import { GatacaService } from './gataca.service';

describe('GatacaService', () => {
  let service: GatacaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GatacaService],
    }).compile();

    service = module.get<GatacaService>(GatacaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
