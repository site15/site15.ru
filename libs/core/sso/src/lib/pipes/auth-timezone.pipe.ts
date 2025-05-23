import { TIMEZONE_OFFSET } from '@nestjs-mod/misc';
import { Injectable, PipeTransform } from '@nestjs/common';
import { SsoTimezoneService } from '../services/sso-timezone.service';
import { SsoAsyncLocalStorageContext } from '../types/sso-async-local-storage-data';

@Injectable()
export class SsoTimezonePipe implements PipeTransform {
  constructor(
    private readonly asyncLocalStorage: SsoAsyncLocalStorageContext,
    private readonly authTimezoneService: SsoTimezoneService
  ) {}

  transform(value: unknown) {
    const result = this.authTimezoneService.convertObject(
      value,
      -1 * (this.asyncLocalStorage.get()?.authTimezone || 0) - TIMEZONE_OFFSET
    );

    return this.authTimezoneService.convertDatesInObjectToDateStrings(result);
  }
}
