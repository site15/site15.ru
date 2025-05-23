import { Inject, Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import {
  LangToLocaleMapping,
  TRANSLOCO_LOCALE_LANG_MAPPING,
} from '@jsverse/transloco-locale';
import { ActiveLangService } from '@nestjs-mod/afat';
import {
  SsoRestSdkAngularService,
  SsoErrorEnumInterface,
  SsoErrorInterface,
} from '@nestjs-mod/sso-rest-sdk-angular';
import { catchError, map, mergeMap, of, tap, throwError } from 'rxjs';
import { TokensService } from './tokens.service';

const AUTH_ACTIVE_USER_LANG_LOCAL_STORAGE_KEY = 'activeUserLang';
const AUTH_ACTIVE_GUEST_LANG_LOCAL_STORAGE_KEY = 'activeGuestLang';

@Injectable({ providedIn: 'root' })
export class SsoActiveLangService {
  constructor(
    private readonly ssoRestSdkAngularService: SsoRestSdkAngularService,
    private readonly translocoService: TranslocoService,
    @Inject(TRANSLOCO_LOCALE_LANG_MAPPING)
    readonly langToLocaleMapping: LangToLocaleMapping,
    private readonly activeLangService: ActiveLangService,
    private readonly tokensService: TokensService
  ) {}

  refreshActiveLang(loadDictionaries?: boolean) {
    return this.getActiveLang().pipe(
      mergeMap((lang) => this.localSetActiveLang(lang, loadDictionaries))
    );
  }

  clearLocalStorage() {
    localStorage.removeItem(AUTH_ACTIVE_USER_LANG_LOCAL_STORAGE_KEY);
  }

  localGetActiveLang() {
    return of(
      localStorage.getItem(AUTH_ACTIVE_USER_LANG_LOCAL_STORAGE_KEY) ||
        localStorage.getItem(AUTH_ACTIVE_GUEST_LANG_LOCAL_STORAGE_KEY) ||
        this.translocoService.getDefaultLang()
    );
  }

  getActiveLang() {
    if (!this.tokensService.getAccessToken()) {
      return this.localGetActiveLang();
    }

    return this.ssoRestSdkAngularService
      .getSsoApi()
      .ssoControllerProfile()
      .pipe(
        mergeMap((profile) => {
          return profile.lang ? of(profile.lang) : this.localGetActiveLang();
        }),
        catchError((err) => {
          if (
            'error' in err &&
            (err.error as SsoErrorInterface).code ===
              SsoErrorEnumInterface.SSO_013
          ) {
            return this.localGetActiveLang();
          }
          return throwError(() => err);
        })
      );
  }

  localSetActiveLang(lang: string, loadDictionaries?: boolean) {
    localStorage.setItem(AUTH_ACTIVE_USER_LANG_LOCAL_STORAGE_KEY, lang);
    localStorage.setItem(AUTH_ACTIVE_GUEST_LANG_LOCAL_STORAGE_KEY, lang);

    if (loadDictionaries) {
      return this.translocoService.load(lang).pipe(
        tap(() => {
          this.activeLangService.applyActiveLang(lang);
        }),
        map(() => null)
      );
    }
    this.activeLangService.applyActiveLang(lang);
    return of(null);
  }

  setActiveLang(lang: string, loadDictionaries?: boolean) {
    if (!this.tokensService.getAccessToken()) {
      return this.localSetActiveLang(lang, loadDictionaries);
    }

    return this.ssoRestSdkAngularService
      .getSsoApi()
      .ssoControllerUpdateProfile({ lang })
      .pipe(
        mergeMap(() => this.localSetActiveLang(lang, loadDictionaries)),
        catchError((err) => {
          if (
            'error' in err &&
            (err.error as SsoErrorInterface).code ===
              SsoErrorEnumInterface.SSO_013
          ) {
            return this.localSetActiveLang(lang, loadDictionaries);
          }
          return throwError(() => err);
        })
      );
  }
}
