import { Test, TestingModule } from '@nestjs/testing';
import { IdaService } from './ida.service';

describe('IdaService', () => {
  let service: IdaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IdaService],
    }).compile();

    service = module.get<IdaService>(IdaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
