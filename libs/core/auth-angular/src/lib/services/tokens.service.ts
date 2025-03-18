import { Injectable } from '@angular/core';
import { BehaviorSubject, from, map, merge, mergeMap, of, tap } from 'rxjs';
import { AuthTokens } from './auth.types';
import { load } from '@fingerprintjs/fingerprintjs';

@Injectable({ providedIn: 'root' })
export class TokensService {
  private tokens$ = new BehaviorSubject<AuthTokens | undefined>(undefined);

  getFingerprint() {
    const fingerprint = localStorage.getItem('fingerprint');
    if (!fingerprint) {
      return from(load()).pipe(
        mergeMap((fp) => fp.get()),
        map((result) => {
          localStorage.setItem('fingerprint', result.visitorId);
          return result.visitorId;
        })
      );
    }
    return of(fingerprint);
  }

  getRefreshToken() {
    return ''; //this.tokens$.value?.refresh_token || localStorage.getItem('refreshToken')
  }

  getAccessToken() {
    return this.tokens$.value?.access_token;
  }

  setTokens(tokens: AuthTokens | undefined) {
    this.tokens$.next(tokens);
    if (tokens?.refresh_token) {
      localStorage.setItem('refreshToken', tokens.refresh_token);
    } else {
      localStorage.removeItem('refreshToken');
    }
  }

  getStream() {
    return merge(of(this.tokens$.value), this.tokens$.asObservable());
  }
}
