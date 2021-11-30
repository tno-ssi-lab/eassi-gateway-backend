import { Test, TestingModule } from '@nestjs/testing';
import { TrinsicService } from './trinsic.service';

describe('TrinsicService', () => {
  let service: TrinsicService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrinsicService],
    }).compile();

    service = module.get<TrinsicService>(TrinsicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
