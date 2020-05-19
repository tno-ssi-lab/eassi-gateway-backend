import { Test, TestingModule } from '@nestjs/testing';
import { RequestsGateway } from './requests.gateway';

describe('RequestsGateway', () => {
  let gateway: RequestsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestsGateway],
    }).compile();

    gateway = module.get<RequestsGateway>(RequestsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
