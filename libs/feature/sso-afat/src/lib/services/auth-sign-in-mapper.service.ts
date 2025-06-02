import { Injectable } from '@angular/core';
import { SsoLoginInput } from './auth.types';

@Injectable({ providedIn: 'root' })
export class SsoSignInMapperService {
  toModel(data: SsoLoginInput) {
    return {
      email: data['email'],
      password: data['password'],
    };
  }

  toJson(data: SsoLoginInput) {
    return {
      email: data['email'],
      password: data['password'],
    };
  }
}
