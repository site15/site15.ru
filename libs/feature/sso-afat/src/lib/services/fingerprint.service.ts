import { Injectable } from '@angular/core';
import { load } from '@fingerprintjs/fingerprintjs';
import { from, map, mergeMap, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FingerprintService {
  getFingerprint() {
    const fingerprint = localStorage.getItem('fingerprint');
    if (!fingerprint) {
      return from(load()).pipe(
        mergeMap((fp) => fp.get()),
        map((result) => {
          localStorage.setItem('fingerprint', result.visitorId);
          return result.visitorId;
        }),
      );
    }
    return of(fingerprint);
  }
}
