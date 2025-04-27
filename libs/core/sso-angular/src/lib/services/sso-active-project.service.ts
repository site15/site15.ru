import { Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, tap } from 'rxjs';
import { SsoProjectModel } from './sso-project-mapper.service';
import { SsoProjectService } from './sso-project.service';

export const SSO_ACTIVE_USER_CLIENT_ID_STORAGE_KEY = 'activeUserClientId';
export const X_CLIENT_ID_HEADER_NAME = 'x-client-id';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class SsoActiveProjectService {
  publicProjects$ = new BehaviorSubject<SsoProjectModel[] | undefined>(
    undefined
  );

  activePublicProject$ = new BehaviorSubject<SsoProjectModel | undefined>(
    undefined
  );

  getAuthorizationHeaders(): Record<string, string> {
    const clientId = localStorage.getItem(
      SSO_ACTIVE_USER_CLIENT_ID_STORAGE_KEY
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
        SSO_ACTIVE_USER_CLIENT_ID_STORAGE_KEY,
        activePublicProject.clientId
      );
    } else {
      localStorage.removeItem(SSO_ACTIVE_USER_CLIENT_ID_STORAGE_KEY);
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
                localStorage.getItem(SSO_ACTIVE_USER_CLIENT_ID_STORAGE_KEY)
            ) || projects.ssoPublicProjects[0]
          );
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }
}
