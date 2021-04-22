import { Test, TestingModule } from '@nestjs/testing';
import { TrinsicController } from './trinsic.controller';

describe('Trinsic Controller', () => {
  let controller: TrinsicController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrinsicController],
    }).compile();

    controller = module.get<TrinsicController>(TrinsicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
