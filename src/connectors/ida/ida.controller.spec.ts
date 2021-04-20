import { Test, TestingModule } from '@nestjs/testing';
import { IdaController } from './ida.controller';

describe('Ida Controller', () => {
  let controller: IdaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IdaController],
    }).compile();

    controller = module.get<IdaController>(IdaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
