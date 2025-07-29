import path from 'node:path';
import slash from 'slash';
import { isAnnotatedWith, isId, isRelation, isUnique } from './field-classifiers';
import { scalarToTS } from './template-helpers';
import type { DMMF } from '@prisma/generator-helper';
import { WritableDeep } from 'type-fest';
import type { TemplateHelpers } from './template-helpers';
import type { IApiProperty, IClassValidator, IDecorators, ImportStatementParams, Model, ParsedField } from './types';
import { parseApiProperty } from './api-decorator';
import { parseClassValidators } from './class-validator';
import { DTO_OVERRIDE_API_PROPERTY_TYPE, DTO_CAST_TYPE, DTO_OVERRIDE_TYPE } from './annotations';

export const uniq = <T = any>(input: T[]): T[] => Array.from(new Set(input));
export const concatIntoArray = <T = any>(source: T[], target: T[]) => source.forEach((item) => target.push(item));

export function concatUniqueIntoArray<T = any>(source: T[], target: T[]): void;
export function concatUniqueIntoArray<T = { [key: string]: any }>(source: T[], target: T[], prop: string): void;
export function concatUniqueIntoArray<T = any>(source: T[], target: T[], prop?: string): void {
  const find = prop
    ? (item: T) => !target.find((v) => (v as any)[prop] === (item as any)[prop])
    : (item: T) => target.indexOf(item) < 0;
  source.filter(find).forEach((item) => target.push(item));
}

export const makeImportsFromPrismaClient = (
  fields: ParsedField[],
  prismaClientImportPath: string,
  importEnums = true,
): ImportStatementParams[] => {
  const enumsToImport = importEnums ? uniq(fields.filter(({ kind }) => kind === 'enum').map(({ type }) => type)) : [];
  const importPrisma = fields
    .filter(({ kind }) => kind === 'scalar')
    .some(
      ({ type, documentation }) =>
        !isAnnotatedWith({ documentation }, DTO_CAST_TYPE) &&
        !isAnnotatedWith({ documentation }, DTO_OVERRIDE_TYPE) &&
        scalarToTS(type).includes('Prisma'),
    );

  return enumsToImport.length || importPrisma
    ? [
        {
          from: prismaClientImportPath,
          destruct: importPrisma ? ['Prisma', ...enumsToImport] : enumsToImport,
        },
      ]
    : [];
};

export const makeCustomImports = (fields: ParsedField[]): ImportStatementParams[] => {
  return [[DTO_OVERRIDE_TYPE, DTO_CAST_TYPE], [DTO_OVERRIDE_API_PROPERTY_TYPE]].flatMap((annotations) => {
    // Walk the fields for any that have a DtoOverrideType/DtoApiOverrideType annotation that
    // requires a custom import to be appended.
    return fields.flatMap(({ documentation }) => {
      // const castType = isAnnotatedWith({ documentation }, DTO_CAST_TYPE, {
      //   returnAnnotationParameters: true,
      // });
      const castType = annotations.reduce((cast: string | false, annotation) => {
        if (cast) return cast;
        return isAnnotatedWith({ documentation }, annotation, {
          returnAnnotationParameters: true,
        });
      }, false);
      if (!castType || !castType.includes(',')) {
        return [];
      }

      const [importAs, importFrom, importWas] = castType.split(',').map((s) => s.trim());

      if (!importFrom) {
        throw new Error("Invalid DTOCastType annotation. Requesting import but did not provide 'from' value.");
      }

      if (!importWas || importWas === importAs) {
        return {
          from: importFrom,
          destruct: [importAs],
        };
      } else if (importWas === 'default') {
        return {
          from: importFrom,
          default: importAs,
        };
      } else if (importWas === '*') {
        return {
          from: importFrom,
          default: { '*': importAs },
        };
      } else {
        return {
          from: importFrom,
          destruct: [{ [importWas]: importAs }],
        };
      }
    });
  });
};

export const mapDMMFToParsedField = (
  field: WritableDeep<DMMF.Field> | ParsedField,
  overrides: Partial<ParsedField> = {},
  decorators: IDecorators = {},
): ParsedField => ({
  ...field,
  ...overrides,
  ...decorators,
});

export const getRelationScalars = (fields: ParsedField[]): Record<string, string[]> => {
  const scalars = fields.flatMap(({ relationFromFields = [] }) => relationFromFields);

  return scalars.reduce(
    (result, scalar) => ({
      ...result,
      [scalar]: fields
        .filter(({ relationFromFields = [] }) => relationFromFields.includes(scalar))
        .map(({ name }) => name),
    }),
    {} as Record<string, string[]>,
  );
};

interface GetRelationConnectInputFieldsParam {
  field: ParsedField;
  allModels: DMMF.Model[];
}
export const getRelationConnectInputFields = ({
  field,
  allModels,
}: GetRelationConnectInputFieldsParam): Set<DMMF.Field> => {
  const { name, type, relationToFields = [] } = field;

  if (!isRelation(field)) {
    throw new Error(`Can not resolve RelationConnectInputFields for field '${name}'. Not a relation field.`);
  }

  const relatedModel = allModels.find(({ name: modelName }) => modelName === type);

  if (!relatedModel) {
    throw new Error(`Can not resolve RelationConnectInputFields for field '${name}'. Related model '${type}' unknown.`);
  }

  if (!relationToFields.length) {
    throw new Error(`Can not resolve RelationConnectInputFields for field '${name}'. Foreign keys are unknown.`);
  }

  const foreignKeyFields = relationToFields.map((relationToFieldName) => {
    const relatedField = relatedModel.fields.find(
      (relatedModelField) => relatedModelField.name === relationToFieldName,
    );

    if (!relatedField)
      throw new Error(`Can not find foreign key field '${relationToFieldName}' on model '${relatedModel.name}'`);

    return relatedField;
  });

  const idFields = relatedModel.fields.filter((relatedModelField) => isId(relatedModelField));

  const uniqueFields = relatedModel.fields.filter((relatedModelField) => isUnique(relatedModelField));

  const foreignFields = new Set<DMMF.Field>([...foreignKeyFields, ...idFields, ...uniqueFields]);

  return foreignFields;
};

export const getRelativePath = (from: string, to: string) => {
  const result = slash(path.relative(from, to));
  return result || '.';
};

interface GenerateRelationInputParam {
  field: ParsedField;
  model: Model;
  allModels: Model[];
  templateHelpers: TemplateHelpers;
  preAndSuffixClassName: TemplateHelpers['createDtoName'] | TemplateHelpers['updateDtoName'];
  canCreateAnnotation: RegExp;
  canConnectAnnotation: RegExp;
  canUpdateAnnotation?: RegExp;
  canDisconnectAnnotation?: RegExp;
}
export const generateRelationInput = ({
  field,
  model,
  allModels,
  templateHelpers: t,
  preAndSuffixClassName,
  canCreateAnnotation,
  canConnectAnnotation,
  canUpdateAnnotation,
  canDisconnectAnnotation,
}: GenerateRelationInputParam) => {
  const relationInputClassProps: Array<Pick<ParsedField, 'name' | 'type' | 'apiProperties' | 'classValidators'>> = [];

  const imports: ImportStatementParams[] = [];
  const apiExtraModels: string[] = [];
  const generatedClasses: string[] = [];
  const classValidators: IClassValidator[] = [];

  const createRelation = isAnnotatedWith(field, canCreateAnnotation);
  const connectRelation = isAnnotatedWith(field, canConnectAnnotation);
  const updatetRelation = canUpdateAnnotation ? isAnnotatedWith(field, canUpdateAnnotation) : undefined;
  const disconnectRelation = canDisconnectAnnotation ? isAnnotatedWith(field, canDisconnectAnnotation) : undefined;
  // should the validation require the relation field to exist
  // this should only be true in cases where only one relation field is generated
  // for multiple relation fields, e.g. create AND connect, each should be optional
  const isRequired =
    [createRelation, connectRelation, updatetRelation, disconnectRelation].filter((v) => v).length === 1;

  const rawCastType = [DTO_OVERRIDE_TYPE, DTO_CAST_TYPE].reduce((cast: string | false, annotation) => {
    if (cast) return cast;
    return isAnnotatedWith(field, annotation, {
      returnAnnotationParameters: true,
    });
  }, false);
  const castType = rawCastType ? rawCastType.split(',')[0] : undefined;
  const rawCastApiType = isAnnotatedWith(field, DTO_OVERRIDE_API_PROPERTY_TYPE, {
    returnAnnotationParameters: true,
  });
  const castApiType = rawCastApiType ? rawCastApiType.split(',')[0] : undefined;

  if (createRelation) {
    const preAndPostfixedName = t.createDtoName(field.type);
    apiExtraModels.push(preAndPostfixedName);

    const modelToImportFrom = allModels.find(({ name }) => name === field.type);

    if (!modelToImportFrom)
      throw new Error(`related model '${field.type}' for '${model.name}.${field.name}' not found`);

    imports.push({
      from: slash(
        `${getRelativePath(model.output.dto, modelToImportFrom.output.dto)}${
          path.sep
        }${t.createDtoFilename(field.type)}`,
      ),
      destruct: [preAndPostfixedName],
    });

    const decorators: {
      apiProperties?: IApiProperty[];
      classValidators?: IClassValidator[];
    } = {};

    if (t.config.classValidation) {
      decorators.classValidators = parseClassValidators({ ...field, isRequired }, castType || preAndPostfixedName);
      concatUniqueIntoArray(decorators.classValidators, classValidators, 'name');
    }

    if (!t.config.noDependencies) {
      decorators.apiProperties = parseApiProperty({ ...field, isRequired, isNullable: false }, { type: false });
      decorators.apiProperties.push({
        name: 'type',
        value: castApiType ? '() => ' + castApiType : preAndPostfixedName,
        noEncapsulation: true,
      });
      if (field.isList) decorators.apiProperties.push({ name: 'isArray', value: 'true' });
    }

    relationInputClassProps.push({
      name: 'create',
      type: castType || preAndPostfixedName,
      apiProperties: decorators.apiProperties,
      classValidators: decorators.classValidators,
    });
  }

  if (connectRelation) {
    const preAndPostfixedName = t.connectDtoName(field.type);
    apiExtraModels.push(preAndPostfixedName);
    const modelToImportFrom = allModels.find(({ name }) => name === field.type);

    if (!modelToImportFrom)
      throw new Error(`related model '${field.type}' for '${model.name}.${field.name}' not found`);

    imports.push({
      from: slash(
        `${getRelativePath(model.output.dto, modelToImportFrom.output.dto)}${
          path.sep
        }${t.connectDtoFilename(field.type)}`,
      ),
      destruct: [preAndPostfixedName],
    });

    const decorators: {
      apiProperties?: IApiProperty[];
      classValidators?: IClassValidator[];
    } = {};

    if (t.config.classValidation) {
      decorators.classValidators = parseClassValidators({ ...field, isRequired }, castType || preAndPostfixedName);
      concatUniqueIntoArray(decorators.classValidators, classValidators, 'name');
    }

    if (!t.config.noDependencies) {
      decorators.apiProperties = parseApiProperty({ ...field, isRequired, isNullable: false }, { type: false });
      decorators.apiProperties.push({
        name: 'type',
        value: castApiType ? '() => ' + castApiType : preAndPostfixedName,
        noEncapsulation: true,
      });
      if (field.isList) decorators.apiProperties.push({ name: 'isArray', value: 'true' });
    }

    relationInputClassProps.push({
      name: 'connect',
      type: castType || preAndPostfixedName,
      apiProperties: decorators.apiProperties,
      classValidators: decorators.classValidators,
    });
  }

  if (disconnectRelation) {
    if (field.isRequired && !field.isList) {
      throw new Error(`The disconnect annotation is not supported for required field '${model.name}.${field.name}'`);
    }

    if (!field.isList) {
      const decorators: {
        apiProperties?: IApiProperty[];
        classValidators?: IClassValidator[];
      } = {};

      if (t.config.classValidation) {
        decorators.classValidators = parseClassValidators({
          ...field,
          isRequired,
          type: 'Boolean',
          kind: 'scalar',
        });
        concatUniqueIntoArray(decorators.classValidators, classValidators, 'name');
      }

      if (!t.config.noDependencies) {
        decorators.apiProperties = parseApiProperty({ ...field, isRequired, isNullable: false }, { type: false });
        decorators.apiProperties.push({
          name: 'type',
          value: 'boolean',
          noEncapsulation: false,
        });
      }

      relationInputClassProps.push({
        name: 'disconnect',
        type: 'boolean',
        apiProperties: decorators.apiProperties,
        classValidators: decorators.classValidators,
      });
    } else {
      const preAndPostfixedName = t.connectDtoName(field.type);
      apiExtraModels.push(preAndPostfixedName);
      const modelToImportFrom = allModels.find(({ name }) => name === field.type);

      if (!modelToImportFrom)
        throw new Error(`related model '${field.type}' for '${model.name}.${field.name}' not found`);

      imports.push({
        from: slash(
          `${getRelativePath(model.output.dto, modelToImportFrom.output.dto)}${
            path.sep
          }${t.connectDtoFilename(field.type)}`,
        ),
        destruct: [preAndPostfixedName],
      });

      const decorators: {
        apiProperties?: IApiProperty[];
        classValidators?: IClassValidator[];
      } = {};

      if (t.config.classValidation) {
        decorators.classValidators = parseClassValidators({ ...field, isRequired }, castType || preAndPostfixedName);
        concatUniqueIntoArray(decorators.classValidators, classValidators, 'name');
      }

      if (!t.config.noDependencies) {
        decorators.apiProperties = parseApiProperty({ ...field, isRequired, isNullable: false }, { type: false });
        decorators.apiProperties.push({
          name: 'type',
          value: castApiType ? '() => ' + castApiType : preAndPostfixedName,
          noEncapsulation: true,
        });
      }

      relationInputClassProps.push({
        name: 'disconnect',
        type: castType || preAndPostfixedName,
        apiProperties: decorators.apiProperties,
        classValidators: decorators.classValidators,
      });
    }
  }

  if (updatetRelation) {
    if (field.isList) {
      throw new Error(
        `model ${model.name} { ${field.name} ${field.type}[] } - ${canUpdateAnnotation?.source} cannot be applied to "-to-many" relations!`,
      );
    }
    const preAndPostfixedName = t.updateDtoName(field.type);
    apiExtraModels.push(preAndPostfixedName);
    const modelToImportFrom = allModels.find(({ name }) => name === field.type);

    if (!modelToImportFrom)
      throw new Error(`related model '${field.type}' for '${model.name}.${field.name}' not found`);

    imports.push({
      from: slash(
        `${getRelativePath(model.output.dto, modelToImportFrom.output.dto)}${
          path.sep
        }${t.updateDtoFilename(field.type)}`,
      ),
      destruct: [preAndPostfixedName],
    });

    const decorators: {
      apiProperties?: IApiProperty[];
      classValidators?: IClassValidator[];
    } = {};

    if (t.config.classValidation) {
      decorators.classValidators = parseClassValidators({ ...field, isRequired }, castType || preAndPostfixedName);
      concatUniqueIntoArray(decorators.classValidators, classValidators, 'name');
    }

    if (!t.config.noDependencies) {
      decorators.apiProperties = parseApiProperty({ ...field, isRequired, isNullable: false }, { type: false });
      decorators.apiProperties.push({
        name: 'type',
        value: castApiType ? '() => ' + castApiType : preAndPostfixedName,
        noEncapsulation: true,
      });
    }

    relationInputClassProps.push({
      name: 'update',
      type: castType || preAndPostfixedName,
      apiProperties: decorators.apiProperties,
      classValidators: decorators.classValidators,
    });
  }

  if (!relationInputClassProps.length) {
    throw new Error(`Can not find relation input props for '${model.name}.${field.name}'`);
  }

  if (t.config.wrapRelationsAsType) {
    relationInputClassProps.forEach((prop) => {
      prop.type += 'AsType';
    });
    imports.forEach(({ destruct }) => {
      if (destruct && destruct[0]) {
        destruct.push(`type ${destruct[0]} as ${destruct[0]}AsType`);
      }
    });
  }

  const originalInputClassName = `${t.transformClassNameCase(
    model.name,
  )}${t.transformClassNameCase(field.name)}RelationInput`;

  const preAndPostfixedInputClassName = preAndSuffixClassName(originalInputClassName);
  generatedClasses.push(`${t.config.outputType} ${preAndPostfixedInputClassName} {
    ${t.fieldsToDtoProps(
      relationInputClassProps.map((inputField) => ({
        ...inputField,
        kind: 'relation-input',
        isRequired: relationInputClassProps.length === 1,
        isList: field.isList,
        isId: field.isId,
        isUnique: field.isUnique,
        isReadOnly: field.isReadOnly,
        documentation: field.documentation,
      })),
      'plain',
      true,
    )}
  }`);

  apiExtraModels.push(preAndPostfixedInputClassName);

  return {
    type: preAndPostfixedInputClassName,
    imports,
    generatedClasses,
    apiExtraModels,
    classValidators,
  };
};

interface GenerateUniqueInputParam {
  compoundName: string;
  fields: ParsedField[];
  model: Model;
  templateHelpers: TemplateHelpers;
}
export const generateUniqueInput = ({ compoundName, fields, model, templateHelpers: t }: GenerateUniqueInputParam) => {
  const imports: ImportStatementParams[] = [];
  const apiExtraModels: string[] = [];
  const generatedClasses: string[] = [];
  const classValidators: IClassValidator[] = [];

  const parsedFields = fields.map((field) => {
    const overrides: Partial<ParsedField> = { isRequired: true };
    const decorators: {
      apiProperties?: IApiProperty[];
      classValidators?: IClassValidator[];
    } = {};

    if (t.config.classValidation) {
      decorators.classValidators = parseClassValidators({
        ...field,
        ...overrides,
      });
      concatUniqueIntoArray(decorators.classValidators, classValidators, 'name');
    }

    if (!t.config.noDependencies) {
      decorators.apiProperties = parseApiProperty(
        {
          ...field,
          ...overrides,
        },
        {
          type: t.config.outputApiPropertyType,
        },
      );
      const typeProperty = decorators.apiProperties.find((p) => p.name === 'type');
      if (typeProperty?.value === field.type && field.type === 'Json') typeProperty.value = '() => Object';
    }

    if (t.config.noDependencies) {
      if (field.type === 'Json') field.type = 'Object';
      else if (field.type === 'Decimal') field.type = 'String';
    }

    return mapDMMFToParsedField(field, overrides, decorators);
  });

  const originalInputClassName = `${t.transformClassNameCase(
    model.name,
  )}${t.transformClassNameCase(compoundName)}UniqueInput`;
  const preAndPostfixedInputClassName = t.plainDtoName(originalInputClassName);

  generatedClasses.push(`${t.config.outputType} ${preAndPostfixedInputClassName} {
    ${t.fieldsToDtoProps(parsedFields, 'plain', true)}
  }`);

  apiExtraModels.push(preAndPostfixedInputClassName);

  const importPrismaClient = makeImportsFromPrismaClient(fields, t.config.prismaClientImportPath);
  const customImports = makeCustomImports(fields);

  return {
    type: preAndPostfixedInputClassName,
    imports: zipImportStatementParams([...importPrismaClient, ...customImports, ...imports]),
    generatedClasses,
    apiExtraModels,
    classValidators,
  };
};

export const mergeImportStatements = (
  first: ImportStatementParams,
  second: ImportStatementParams,
): ImportStatementParams => {
  if (first.from !== second.from) {
    throw new Error(`Can not merge import statements; 'from' parameter is different`);
  }

  if (first.default && second.default && first.default !== second.default) {
    throw new Error(`Can not merge import statements; both statements have set the 'default' preoperty`);
  }

  const firstDestruct = first.destruct || [];
  const secondDestruct = second.destruct || [];
  const destructStrings = uniq(
    [...firstDestruct, ...secondDestruct].filter((destructItem) => typeof destructItem === 'string'),
  );

  const destructObject = [...firstDestruct, ...secondDestruct].reduce(
    (result: Record<string, string>, destructItem) => {
      if (typeof destructItem === 'string') return result;

      return { ...result, ...destructItem };
    },
    {} as Record<string, string>,
  );

  return {
    ...first,
    ...second,
    destruct: [...destructStrings, destructObject],
  };
};

export const zipImportStatementParams = (items: ImportStatementParams[]): ImportStatementParams[] => {
  const itemsByFrom = items.reduce(
    (result, item) => {
      const { from } = item;
      const { [from]: existingItem } = result;
      if (!existingItem) {
        return { ...result, [from]: item };
      }
      return { ...result, [from]: mergeImportStatements(existingItem, item) };
    },
    {} as Record<ImportStatementParams['from'], ImportStatementParams>,
  );

  const imports = Object.values(itemsByFrom);

  imports.forEach((item) => {
    item.destruct?.sort();
  });

  return imports;
};
