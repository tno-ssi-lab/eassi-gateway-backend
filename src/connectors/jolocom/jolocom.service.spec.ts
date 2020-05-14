import { Test, TestingModule } from '@nestjs/testing';
import { JolocomService } from './jolocom.service';

describe('JolocomService', () => {
  let service: JolocomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JolocomService],
    }).compile();

    service = module.get<JolocomService>(JolocomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
