import { Injectable } from '@angular/core';
import { SsoUpdateProfileInput } from './auth.types';

@Injectable({ providedIn: 'root' })
export class SsoProfileMapperService {
  toModel(data: SsoUpdateProfileInput) {
    return {
      oldPassword: data['oldPassword'],
      newPassword: data['newPassword'],
      confirmNewPassword: data['confirmNewPassword'],
      picture: data['picture'],
      timezone: data['timezone'],
    };
  }

  toJson(data: SsoUpdateProfileInput) {
    return {
      oldPassword: data['oldPassword'],
      newPassword: data['newPassword'],
      confirmNewPassword: data['confirmNewPassword'],
      picture: data['picture'],
      timezone: data['timezone'],
    };
  }
}
