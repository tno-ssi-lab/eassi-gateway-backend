import { Test, TestingModule } from '@nestjs/testing';
import { JolocomController } from './jolocom.controller';

describe('Jolocom Controller', () => {
  let controller: JolocomController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JolocomController],
    }).compile();

    controller = module.get<JolocomController>(JolocomController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
