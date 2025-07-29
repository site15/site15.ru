/* eslint-disable no-useless-escape */
import { DTO_READ_ONLY } from './annotations';
import type { DMMF } from '@prisma/generator-helper';
import { ParsedField } from './types';

const ANNOTATION_PARAMS_REGEX = /(?:\(([@_A-Za-z0-9\-\/\>\+\=\'\.\\\, \[\]]*)\))?/;

export function isAnnotatedWith(
  instance: Pick<DMMF.Field | DMMF.Model, 'documentation'>,
  annotation: RegExp,
  options?: { returnAnnotationParameters?: false },
): boolean;
export function isAnnotatedWith(
  instance: Pick<DMMF.Field | DMMF.Model, 'documentation'>,
  annotation: RegExp,
  options: { returnAnnotationParameters: true },
): false | string;
export function isAnnotatedWith(
  instance: Pick<DMMF.Field | DMMF.Model, 'documentation'>,
  annotation: RegExp,
  options?: { returnAnnotationParameters?: boolean },
): boolean | string {
  const { documentation = '' } = instance;

  if (!options?.returnAnnotationParameters) {
    return annotation.test(documentation);
  } else {
    const annotationAndParams = new RegExp(annotation.source + ANNOTATION_PARAMS_REGEX.source, annotation.flags);

    const match = annotationAndParams.exec(documentation);

    if (match === null || match.length < 2) {
      return false;
    } else {
      return match[1] ?? '';
    }
  }
}

export const isAnnotatedWithOneOf = (instance: DMMF.Field | DMMF.Model, annotations: RegExp[]): boolean =>
  annotations.some((annotation) => isAnnotatedWith(instance, annotation));

// Field properties
// isGenerated, !meaning unknown - assuming this means that the field itself is generated, not the value
// isId,
// isList,
// isReadOnly, !no idea how this is set
// isRequired, !seems to be `true` for 1-n relation
// isUnique, !is not set for `isId` fields
// isUpdatedAt, filled by prisma, should thus be readonly
// kind, scalar, object (relation), enum, unsupported
// name,
// type,
// dbNames, !meaning unknown
// hasDefaultValue,
// default: fieldDefault,
// documentation = '',
// relationName,
// relationFromFields,
// relationToFields,
// relationOnDelete,

export const isId = (field: DMMF.Field | ParsedField): boolean => {
  return field.isId;
};

export const isRequired = (field: DMMF.Field | ParsedField): boolean => {
  return field.isRequired;
};

export const isScalar = (field: DMMF.Field | ParsedField): boolean => {
  return field.kind === 'scalar';
};

export const hasDefaultValue = (field: DMMF.Field | ParsedField): boolean => {
  return !!field.hasDefaultValue;
};

export const isUnique = (field: DMMF.Field | ParsedField): boolean => {
  return field.isUnique;
};

export const isRelation = (field: DMMF.Field | ParsedField): boolean => {
  const { kind, relationName } = field;
  // indicates a `relation` field
  return kind === 'object' && !!relationName;
};

export const isType = (field: DMMF.Field | ParsedField): boolean => {
  return field.kind === 'object' && !field.relationName;
};

export const isIdWithDefaultValue = (field: DMMF.Field | ParsedField): boolean => isId(field) && hasDefaultValue(field);

/**
 * checks if a DMMF.Field either has `isReadOnly` property or is annotated with
 * `@DtoReadOnly` comment.
 *
 * **Note:** this also removes relation scalar fields as they are marked as `isReadOnly`
 */
export const isReadOnly = (field: DMMF.Field | ParsedField): boolean =>
  field.isReadOnly || isAnnotatedWith(field, DTO_READ_ONLY);

export const isUpdatedAt = (field: DMMF.Field | ParsedField): boolean => {
  return !!field.isUpdatedAt;
};

/**
 * for schema-required fields that fallback to a default value when empty.
 *
 * Think: `createdAt` timestamps
 *
 * @example
 * ```prisma
 *  model Post {
 *    createdAt   DateTime @default(now())
 *  }
 *  ```
 */
export const isRequiredWithDefaultValue = (field: DMMF.Field | ParsedField): boolean =>
  isRequired(field) && hasDefaultValue(field);
