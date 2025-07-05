import { Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, tap } from 'rxjs';
import { SsoTenantModel } from './sso-tenant-mapper.service';
import { SsoTenantService } from './sso-tenant.service';

export const SSO_ACTIVE_USER_CLIENT_ID_STORAGE_KEY = 'activeUserClientId';
export const X_CLIENT_ID_HEADER_NAME = 'x-client-id';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class SsoActiveTenantService {
  publicTenants$ = new BehaviorSubject<SsoTenantModel[] | undefined>(undefined);

  activePublicTenant$ = new BehaviorSubject<SsoTenantModel | undefined>(undefined);

  getAuthorizationHeaders(): Record<string, string> {
    const clientId = localStorage.getItem(SSO_ACTIVE_USER_CLIENT_ID_STORAGE_KEY);
    if (clientId) {
      return {
        [X_CLIENT_ID_HEADER_NAME as string]: clientId,
      };
    }
    return {};
  }

  constructor(private readonly ssoTenantService: SsoTenantService) {}

  setActivePublicTenant(activePublicTenant?: SsoTenantModel) {
    if (activePublicTenant?.clientId) {
      localStorage.setItem(SSO_ACTIVE_USER_CLIENT_ID_STORAGE_KEY, activePublicTenant.clientId);
    } else {
      localStorage.removeItem(SSO_ACTIVE_USER_CLIENT_ID_STORAGE_KEY);
    }
    this.activePublicTenant$.next(activePublicTenant);
  }

  loadAvailablePublicTenants() {
    this.ssoTenantService
      .findManyPublic({ filters: {} })
      .pipe(
        tap((tenants) => {
          this.publicTenants$.next(tenants.ssoPublicTenants.length > 1 ? tenants.ssoPublicTenants : undefined);
          this.setActivePublicTenant(
            tenants.ssoPublicTenants.find(
              (p) => p.clientId === localStorage.getItem(SSO_ACTIVE_USER_CLIENT_ID_STORAGE_KEY),
            ) || tenants.ssoPublicTenants[0],
          );
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }
}
