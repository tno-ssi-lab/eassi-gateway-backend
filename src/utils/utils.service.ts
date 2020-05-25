import { Injectable } from '@nestjs/common';
import { sign, SignOptions } from 'jsonwebtoken';

import { randomBytes } from 'crypto';

import { Organization } from '../organizations/organization.entity';

const JWT_ID_SIZE = 9;

@Injectable()
export class UtilsService {
  createSignedJwt(
    data: string | object,
    organization: Organization,
    options: SignOptions = {},
  ) {
    const jwtId = randomBytes(JWT_ID_SIZE).toString('base64');

    return sign(data, organization.sharedSecret, {
      jwtid: jwtId,
      issuer: organization.uuid,
      audience: 'ssi-service-provider', // TODO: Get from config
      ...options,
    });
  }
}
