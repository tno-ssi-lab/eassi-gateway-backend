import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  Inject,
} from '@nestjs/common';
import { RequestsService } from './requests.service';

@Injectable()
export class GetVerifyRequestPipe implements PipeTransform {
  constructor(
    @Inject(RequestsService) private requestsService: RequestsService,
  ) {}

  transform(jwtToken: string, metatdata: ArgumentMetadata) {
    return this.requestsService.decodeVerifyRequestToken(jwtToken);
  }
}

export class GetIssueRequestPipe implements PipeTransform {
  constructor(
    @Inject(RequestsService) private requestsService: RequestsService,
  ) {}

  transform(jwtToken: string, metatdata: ArgumentMetadata) {
    return this.requestsService.decodeIssueRequestToken(jwtToken);
  }
}
