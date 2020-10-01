import { Test, TestingModule } from '@nestjs/testing';
import { IndyService } from './indy.service';

describe('IndyService', () => {
  let service: IndyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IndyService],
    }).compile();

    service = module.get<IndyService>(IndyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
