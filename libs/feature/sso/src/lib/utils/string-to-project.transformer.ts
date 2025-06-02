/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  EnvModelOptions,
  EnvModelPropertyOptions,
  EnvModelPropertyValueTransformer,
} from '@nestjs-mod/common';

export type SsoProjectType = {
  name: string;
  nameLocale: {
    [locale: string]: string;
  };
  clientId: string;
  clientSecret: string;
};

export class StringToProjectsTransformer
  implements EnvModelPropertyValueTransformer
{
  name = 'string-to-projects';
  transform(params: {
    value: any;
    options: EnvModelPropertyOptions;
    modelRootOptions: EnvModelOptions;
    modelOptions: EnvModelOptions;
    obj: any;
  }) {
    if (Array.isArray(params.value)) {
      return params.value;
    }
    return (
      (
        (params.value?.split &&
          params.value
            .split(';')
            .map((s: string) => s.trim())
            .filter(Boolean)) ||
        []
      )
        // sample: name1:ru=название1:tt=исем1,clientId1,clientSecret1
        .map((s: string) => {
          const arr = s.split(',');
          const arr0 = arr[0].split(':');
          const clientId = arr[1];
          const clientSecret = arr[2];
          const name = arr0[0];
          const nameLocale = arr0
            .slice(1)
            .map((w) => {
              const arr = w.split('=');
              return [arr[0], arr[1]] as any;
            })
            .reduce((all, [key, value]) => ({ ...all, [key]: value }), {});

          return {
            name,
            clientId,
            clientSecret,
            nameLocale,
          } as SsoProjectType;
        })
    );
  }
}

export class StringToProjectTransformer
  extends StringToProjectsTransformer
  implements EnvModelPropertyValueTransformer
{
  override name = 'string-to-project';
  override transform(params: {
    value: any;
    options: EnvModelPropertyOptions;
    modelRootOptions: EnvModelOptions;
    modelOptions: EnvModelOptions;
    obj: any;
  }) {
    return super.transform(params)[0];
  }
}
