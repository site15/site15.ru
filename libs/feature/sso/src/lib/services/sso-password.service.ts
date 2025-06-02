import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';

@Injectable()
export class SsoPasswordService {
  createPasswordHash(password: string) {
    return hash(password, 10);
  }

  comparePasswordWithHash({
    password,
    hashedPassword,
  }: {
    password: string;
    hashedPassword: string;
  }) {
    return compare(password, hashedPassword);
  }
}
