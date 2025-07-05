import { Pipe, PipeTransform } from '@angular/core';
import { distinctUntilChanged, map, tap } from 'rxjs';
import { SsoActiveTenantService } from '../services/sso-active-tenant.service';

@Pipe({
  name: 'activeTenant',
  pure: true,
  standalone: true,
})
export class ActiveTenantPipe implements PipeTransform {
  constructor(private readonly ssoActiveTenantService: SsoActiveTenantService) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public transform(value: any) {
    return this.ssoActiveTenantService.activePublicTenant$.asObservable().pipe(
      distinctUntilChanged((prev, cur) => prev?.id === cur?.id),
      map((p) => p || value),
    );
  }
}
