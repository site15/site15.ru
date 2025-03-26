import { TypeOption } from '@ngx-formly/core/lib/models';
import { ButtonInputComponent } from './button-input.component';
import { DateInputComponent } from './date-input.component';
import { NzButtonType } from 'ng-zorro-antd/button';

export const COMMON_FORMLY_FIELDS: TypeOption[] = [
  {
    name: 'date-input',
    component: DateInputComponent,
    extends: 'input',
  },
  {
    name: 'button-input',
    component: ButtonInputComponent,
    wrappers: ['form-field'],
    defaultOptions: {
      props: {
        btnType: 'dashed' as NzButtonType,
        type: 'button',
      },
    },
  },
];
