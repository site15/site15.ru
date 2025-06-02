import { Pipe, PipeTransform } from '@angular/core';
import { distinctUntilChanged, map, tap } from 'rxjs';
import { SsoActiveProjectService } from '../services/sso-active-project.service';

@Pipe({
  name: 'activeProject',
  pure: true,
  standalone: true,
})
export class ActiveProjectPipe implements PipeTransform {
  constructor(
    private readonly ssoActiveProjectService: SsoActiveProjectService
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public transform(value: any) {
    return this.ssoActiveProjectService.activePublicProject$
      .asObservable()
      .pipe(
        distinctUntilChanged((prev, cur) => prev?.id === cur?.id),
        map((p) => p || value)
      );
  }
}
