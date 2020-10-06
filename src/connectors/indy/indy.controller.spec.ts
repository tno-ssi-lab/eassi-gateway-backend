import { Test, TestingModule } from '@nestjs/testing';
import { IndyController } from './indy.controller';

describe('Indy Controller', () => {
  let controller: IndyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IndyController],
    }).compile();

    controller = module.get<IndyController>(IndyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
