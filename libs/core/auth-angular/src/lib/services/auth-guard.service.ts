import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { first, map, of } from 'rxjs';
import { AuthService } from './auth.service';
export const AUTH_GUARD_DATA_ROUTE_KEY = 'authGuardData';

export class AuthGuardData {
  roles?: string[];

  constructor(options?: AuthGuardData) {
    Object.assign(this, options);
  }
}

@Injectable({ providedIn: 'root' })
export class AuthGuardService implements CanActivate {
  constructor(private readonly authAuthService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot) {
    const authGuardData =
      route.data &&
      route.data[AUTH_GUARD_DATA_ROUTE_KEY] instanceof AuthGuardData
        ? route.data[AUTH_GUARD_DATA_ROUTE_KEY]
        : null;
    if (authGuardData) {
      return this.checkUserRoles(authGuardData?.roles).pipe(first());
    }
    return of(true);
  }

  checkUserRoles(authRoles?: string[]) {
    return this.authAuthService.profile$.pipe(
      map((authUser) => {
        const authGuardDataRoles = (authRoles || []).map((role) =>
          role.toLowerCase()
        );
        const result = Boolean(
          (authUser &&
            authGuardDataRoles.length > 0 &&
            authGuardDataRoles.some((r) =>
              authUser.roles?.map((r) => r.toLowerCase()).includes(r)
            )) ||
            (authGuardDataRoles.length === 0 && !authUser?.roles)
        );
        if (!result) {
          console.log(result, { authUser, authGuardDataRoles }, [
            [
              authUser,
              authGuardDataRoles.length > 0,
              authUser &&
                authGuardDataRoles
                  .map((role) => role.toLowerCase())
                  .some((r) =>
                    authUser.roles?.map((r) => r.toLowerCase()).includes(r)
                  ),
            ],
            [authGuardDataRoles.length === 0, !authUser?.roles],
          ]);
        }
        return result;
      })
    );
  }
}
