import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Injector,
  OnInit,
} from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { tuiIsPresent, TUI_DEFAULT_MATCHER } from "@taiga-ui/cdk";
import {
  TuiAlertService,
  TuiDialogService,
  TuiNotification,
} from "@taiga-ui/core";
import { TUI_ARROW } from "@taiga-ui/kit";

import {
  PolymorpheusComponent,
  PolymorpheusContent,
} from "@tinkoff/ng-polymorpheus";

import {
  BehaviorSubject,
  catchError,
  filter,
  map,
  mergeMap,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  tap,
  throwError,
} from "rxjs";

import { IContactType } from "../../../shared/models/contact-type.model";
import { IBackendErrorResponse } from "../../../shared/modules/backend-error/interfaces/backend-error.interface";
import { PromptService } from "../../../shared/modules/prompt/prompt.service";
import { ContactTypeService } from "../../contact-type.service";
import { ContactTypeDetailsComponent } from "../contact-type-details/contact-type-details.component";

const KEYS = {
  Name: "name",
  Title: "title",
  TitleRU: "titleRu",
  Actions: "actions",
};

@UntilDestroy()
@Component({
  selector: "site15-contact-type-list",
  templateUrl: "./contact-type-list.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactTypeListComponent implements OnInit {
  contactTypes$ = new BehaviorSubject<IContactType[]>([]);
  contactTypesDialog!: boolean;

  backendErrorsResponse$ = new Subject<IBackendErrorResponse>();

  /* UI property */
  initial: readonly string[] = ["Name", "Title", "TitleRU", "Actions"];
  enabled = this.initial;
  columns = ["name", "title", "titleRu", "actions"];
  search = "";
  arrow = TUI_ARROW;
  loading$ = new Subject<boolean>();

  private size$ = new BehaviorSubject(10);
  private page$ = new BehaviorSubject(0);
  private dialog$!: Observable<IContactType>;

  direction$ = new BehaviorSubject<-1 | 1>(-1);
  sorter$ = new BehaviorSubject<"name" | "title" | "titleRu">("name");

  total$ = this.contactTypes$.pipe(
    filter(tuiIsPresent),
    map(({ length }) => length),
    startWith(1)
  );

  constructor(
    @Inject(TuiAlertService)
    private alertService: TuiAlertService,
    @Inject(PromptService) private promptService: PromptService,
    @Inject(TuiDialogService) private dialogService: TuiDialogService,
    @Inject(Injector) private injector: Injector,
    private contactTypeService: ContactTypeService
  ) {}

  ngOnInit(): void {
    this.getContactTypes();
  }

  getContactTypes() {
    this.loading$.next(true);
    this.contactTypeService
      .getAllContactTypes()
      .pipe(
        tap((items) => {
          this.contactTypes$.next(items);
          this.loading$.next(false);
        }),
        catchError((err) => {
          return this.handleError(err);
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  deleteContactType(id: number) {
    return this.contactTypeService.deleteContactType(id).pipe(
      tap(() => {
        const items = this.contactTypes$
          .getValue()
          .filter((item) => item.id !== id);
        this.contactTypes$.next(items);
      }),
      catchError((err) => {
        return this.handleError(err);
      }),
      untilDestroyed(this)
    );
  }

  createContactType() {
    this.dialog$ = this.dialogService.open(
      new PolymorpheusComponent(ContactTypeDetailsComponent, this.injector),
      {
        label: "Create",
        dismissible: true,
        data: {
          backendErrors: this.backendErrorsResponse$,
        },
      }
    );

    this.dialog$
      .pipe(
        tap((item) => {
          if (item) {
            console.log("on create");

            const items = this.contactTypes$.getValue();
            items.push(item);
            this.contactTypes$.next([...items]);
          }
        }),
        catchError((err) => {
          return this.handleError(err);
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  editContactType(ct: IContactType) {
    this.dialog$ = this.dialogService.open(
      new PolymorpheusComponent(ContactTypeDetailsComponent, this.injector),
      {
        label: "Edit",
        dismissible: true,
        data: {
          contactType: ct,
          backendErrors: this.backendErrorsResponse$,
        },
      }
    );

    this.dialog$
      .pipe(
        tap((item) => {
          if (item) {
            console.log("on update");

            const items = this.contactTypes$.getValue();
            const index = items.findIndex(({ id }) => item.id === id);
            items[index] = item;
            this.contactTypes$.next([...items]);
          }
        }),
        catchError((err) => {
          return this.handleError(err);
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private handleError(err: IBackendErrorResponse) {
    const { error, status } = err;

    this.backendErrorsResponse$.next(err);

    if (status === 400) {
      return of([]);
    }

    return throwError(() => new Error(JSON.stringify(error)));
  }

  /**
   * UI methods
   */

  confirmDeleting(id: number, template: PolymorpheusContent): void {
    this.promptService
      .open(template, this.promptService.defaultOptions)
      .pipe(
        switchMap((response) => {
          if (response) {
            return this.deleteContactType(id).pipe(
              mergeMap(() =>
                this.alertService.open("Record deleted", {
                  status: TuiNotification.Success,
                })
              )
            );
          }

          return of(response);
        })
      )
      .subscribe();
  }

  onEnabled(enabled: readonly string[]): void {
    this.enabled = enabled;
    this.columns = this.initial
      .filter((column) => enabled.includes(column))
      .map((column) => KEYS[column]);
  }

  onDirection(direction: -1 | 1): void {
    this.direction$.next(direction);
  }

  onSize(size: number): void {
    this.size$.next(size);
  }

  onPage(page: number): void {
    this.page$.next(page);
  }

  isMatch(value: unknown): boolean {
    return !!this.search && TUI_DEFAULT_MATCHER(value, this.search);
  }

  refresh() {
    location.reload();
  }
}
