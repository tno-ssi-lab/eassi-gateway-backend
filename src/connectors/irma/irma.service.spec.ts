import { Test, TestingModule } from '@nestjs/testing';
import { IrmaService } from './irma.service';

describe('IrmaService', () => {
  let service: IrmaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IrmaService],
    }).compile();

    service = module.get<IrmaService>(IrmaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
