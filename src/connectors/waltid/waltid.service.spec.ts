import { Test, TestingModule } from '@nestjs/testing';
import { WaltidService } from './waltid.service';

describe('WaltidService', () => {
  let service: WaltidService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WaltidService],
    }).compile();

    service = module.get<WaltidService>(WaltidService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});