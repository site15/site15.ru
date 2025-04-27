import { Injectable } from '@angular/core';
import { SsoSignupInput } from './auth.types';

@Injectable({ providedIn: 'root' })
export class SsoSignUpMapperService {
  toModel(data: SsoSignupInput) {
    return {
      email: data['email'],
      password: data['password'],
      confirmPassword: data['confirmPassword'],
    };
  }

  toJson(data: SsoSignupInput) {
    return {
      email: data['email'],
      password: data['password'],
      confirmPassword: data['confirmPassword'],
    };
  }
}
