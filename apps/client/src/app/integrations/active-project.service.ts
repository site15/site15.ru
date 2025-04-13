import { Injectable } from '@angular/core';
import {
  SsoProjectModel,
  SsoProjectService,
} from '@nestjs-mod-sso/sso-angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, tap } from 'rxjs';

const AUTH_ACTIVE_USER_CLIENT_ID_STORAGE_KEY = 'activeUserClientId';
const X_CLIENT_ID_HEADER_NAME = 'x-client-id';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class ActiveProjectService {
  publicProjects$ = new BehaviorSubject<SsoProjectModel[] | undefined>(
    undefined
  );

  activePublicProject$ = new BehaviorSubject<SsoProjectModel | undefined>(
    undefined
  );

  getAuthorizationHeaders(): Record<string, string> {
    const clientId = localStorage.getItem(
      AUTH_ACTIVE_USER_CLIENT_ID_STORAGE_KEY
    );
    if (clientId) {
      return {
        [X_CLIENT_ID_HEADER_NAME as string]: clientId,
      };
    }
    return {};
  }

  constructor(private readonly ssoProjectService: SsoProjectService) {}

  setActivePublicProject(activePublicProject?: SsoProjectModel) {
    if (activePublicProject?.clientId) {
      localStorage.setItem(
        AUTH_ACTIVE_USER_CLIENT_ID_STORAGE_KEY,
        activePublicProject.clientId
      );
    } else {
      localStorage.removeItem(AUTH_ACTIVE_USER_CLIENT_ID_STORAGE_KEY);
    }
    this.activePublicProject$.next(activePublicProject);
  }

  loadAvailablePublicProjects() {
    this.ssoProjectService
      .findManyPublic({ filters: {} })
      .pipe(
        tap((projects) => {
          this.publicProjects$.next(
            projects.ssoPublicProjects.length > 1
              ? projects.ssoPublicProjects
              : undefined
          );
          this.setActivePublicProject(
            projects.ssoPublicProjects.find(
              (p) =>
                p.clientId ===
                localStorage.getItem(AUTH_ACTIVE_USER_CLIENT_ID_STORAGE_KEY)
            ) || projects.ssoPublicProjects[0]
          );
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }
}
