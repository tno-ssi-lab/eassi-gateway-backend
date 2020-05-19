import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  Inject,
} from '@nestjs/common';
import { RequestsService } from './requests.service';

@Injectable()
export class DecodeVerifyRequestPipe implements PipeTransform {
  constructor(
    @Inject(RequestsService) private requestsService: RequestsService,
  ) {}

  transform(jwtToken: string, metatdata: ArgumentMetadata) {
    return this.requestsService.decodeVerifyRequestToken(jwtToken);
  }
}

@Injectable()
export class GetVerifyRequestPipe implements PipeTransform {
  constructor(
    @Inject(RequestsService) private requestsService: RequestsService,
  ) {}

  transform(requestId: string, metatdata: ArgumentMetadata) {
    return this.requestsService.findVerifyRequestByRequestId(requestId);
  }
}

@Injectable()
export class DecodeIssueRequestPipe implements PipeTransform {
  constructor(
    @Inject(RequestsService) private requestsService: RequestsService,
  ) {}

  transform(jwtToken: string, metatdata: ArgumentMetadata) {
    return this.requestsService.decodeIssueRequestToken(jwtToken);
  }
}

@Injectable()
export class GetIssueRequestPipe implements PipeTransform {
  constructor(
    @Inject(RequestsService) private requestsService: RequestsService,
  ) {}

  transform(requestId: string, metatdata: ArgumentMetadata) {
    return this.requestsService.findIssueRequestByRequestId(requestId);
  }
}
