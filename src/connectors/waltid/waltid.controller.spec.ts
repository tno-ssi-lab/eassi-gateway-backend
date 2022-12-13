import { Test, TestingModule } from '@nestjs/testing';
import { WaltidController } from './waltid.controller';

describe('Waltid Controller', () => {
  let controller: WaltidController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WaltidController],
    }).compile();

    controller = module.get<WaltidController>(WaltidController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});