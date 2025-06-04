import { AsyncPipe, NgFor, NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  LangDefinition,
  TranslocoDirective,
  TranslocoPipe,
  TranslocoService,
} from '@jsverse/transloco';
import { TranslocoDatePipe } from '@jsverse/transloco-locale';
import { SsoRoleInterface } from '@nestjs-mod/sso-rest-sdk-angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { addHours } from 'date-fns';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';

import { Title } from '@angular/platform-browser';
import { FilesService } from '@nestjs-mod/files-afat';
import {
  CheckUserRolesPipe,
  SsoActiveLangService,
  SsoActiveProjectService,
  SsoProjectModel,
  SsoService,
  TokensService,
  UserPipe,
} from '@nestjs-mod-sso/sso-afat';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import {
  BehaviorSubject,
  map,
  merge,
  mergeMap,
  Observable,
  switchMap,
  tap,
} from 'rxjs';
import { APP_TITLE } from './app.constants';

import { TIMEZONE_OFFSET } from '@nestjs-mod/misc';
import { SsoRestSdkAngularService } from '@nestjs-mod/sso-rest-sdk-angular';
@UntilDestroy()
@Component({
  imports: [
    NzIconModule,
    RouterModule,
    NzMenuModule,
    NzLayoutModule,
    NzTypographyModule,
    AsyncPipe,
    NgForOf,
    NgFor,
    TranslocoPipe,
    TranslocoDirective,
    TranslocoDatePipe,
    CheckUserRolesPipe,
    UserPipe,
    NzAvatarModule,
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  title!: string;
  serverTime$ = new BehaviorSubject<Date>(new Date());
  lang$ = new BehaviorSubject<string>('');
  availableLangs$ = new BehaviorSubject<LangDefinition[]>([]);
  SsoRoleInterface = SsoRoleInterface;

  publicProjects$?: Observable<SsoProjectModel[] | undefined>;
  activePublicProject$?: Observable<SsoProjectModel | undefined>;

  constructor(
    private readonly ssoRestSdkAngularService: SsoRestSdkAngularService,
    private readonly ssoService: SsoService,
    private readonly router: Router,
    private readonly translocoService: TranslocoService,
    private readonly tokensService: TokensService,
    private readonly ssoActiveLangService: SsoActiveLangService,
    private readonly ssoActiveProjectService: SsoActiveProjectService,
    private readonly titleService: Title,
    private readonly filesService: FilesService
  ) {
    this.title = this.translocoService.translate(APP_TITLE);
    this.titleService.setTitle(this.title);
  }

  ngOnInit() {
    this.loadAvailablePublicProjects();

    this.loadAvailableLangs();
    this.subscribeToChangeProfile();
    this.subscribeToLangChanges();

    this.fillServerTime().pipe(untilDestroyed(this)).subscribe();
  }

  getFullFilePath(value: string) {
    return (
      (!value.toLowerCase().startsWith('http')
        ? this.filesService.getMinioURL()
        : '') + value
    );
  }

  setActivePublicProject(activePublicProject?: SsoProjectModel) {
    this.ssoActiveProjectService.setActivePublicProject(activePublicProject);
  }

  private loadAvailablePublicProjects() {
    this.publicProjects$ =
      this.ssoActiveProjectService.publicProjects$.asObservable();
    this.activePublicProject$ =
      this.ssoActiveProjectService.activePublicProject$.asObservable();

    this.ssoActiveProjectService.loadAvailablePublicProjects();
  }

  private subscribeToChangeProfile() {
    this.ssoService.profile$
      .asObservable()
      .pipe(
        mergeMap((profile) => {
          if (!profile) {
            this.ssoActiveLangService.clearLocalStorage();
          }
          return this.ssoActiveLangService.refreshActiveLang();
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  setActiveLang(lang: string) {
    this.ssoActiveLangService
      .setActiveLang(lang)
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  signOut() {
    this.ssoService
      .signOut()
      .pipe(
        tap(() => this.router.navigate(['/home'])),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private loadAvailableLangs() {
    this.availableLangs$.next(
      this.translocoService.getAvailableLangs() as LangDefinition[]
    );
  }

  private subscribeToLangChanges() {
    this.translocoService.langChanges$
      .pipe(
        tap((lang) => {
          this.lang$.next(lang);
          this.ssoActiveProjectService.loadAvailablePublicProjects();
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private fillServerTime() {
    return merge(
      this.ssoRestSdkAngularService.getTimeApi().timeControllerTime(),
      this.tokensService
        .getStream()
        .pipe(
          switchMap((token) =>
            this.ssoRestSdkAngularService.webSocket<string>({
              path: token?.access_token
                ? `/ws/time?token=${token?.access_token}`
                : '/ws/time',
              eventName: 'ChangeTimeStream',
            })
          )
        )
        .pipe(map((result) => result.data))
    ).pipe(
      tap((result) =>
        this.serverTime$.next(
          addHours(new Date(result as string), TIMEZONE_OFFSET)
        )
      )
    );
  }
}
