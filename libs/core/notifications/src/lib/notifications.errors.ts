import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ValidationError as CvNotificationsError } from 'class-validator';
import { getText } from 'nestjs-translates';

export enum NotificationsErrorEnum {
  COMMON = 'NOTIFICATIONS-000',
}

export const NOTIFICATIONS_ERROR_ENUM_TITLES: Record<
  NotificationsErrorEnum,
  string
> = {
  [NotificationsErrorEnum.COMMON]: getText('Notificationserror'),
};

export class NotificationsErrorMetadataConstraint {
  @ApiProperty({
    type: String,
  })
  name!: string;

  @ApiProperty({
    type: String,
  })
  description!: string;

  constructor(options?: NotificationsErrorMetadataConstraint) {
    Object.assign(this, options);
  }
}

export class NotificationsErrorMetadata {
  @ApiProperty({
    type: String,
  })
  property!: string;

  @ApiProperty({
    type: () => NotificationsErrorMetadataConstraint,
    isArray: true,
  })
  constraints!: NotificationsErrorMetadataConstraint[];

  @ApiPropertyOptional({
    type: () => NotificationsErrorMetadata,
    isArray: true,
  })
  children?: NotificationsErrorMetadata[];

  constructor(options?: NotificationsErrorMetadata) {
    Object.assign(this, options);
  }

  static fromClassValidatorNotificationsErrors(
    errors?: CvNotificationsError[]
  ): NotificationsErrorMetadata[] | undefined {
    return errors?.map(
      (error) =>
        new NotificationsErrorMetadata({
          property: error.property,
          constraints: Object.entries(error.constraints || {}).map(
            ([key, value]) =>
              new NotificationsErrorMetadataConstraint({
                name: key,
                description: value,
              })
          ),
          ...(error.children?.length
            ? {
                children: this.fromClassValidatorNotificationsErrors(
                  error.children
                ),
              }
            : {}),
        })
    );
  }
}

export class NotificationsError extends Error {
  @ApiProperty({
    type: String,
    description: Object.entries(NOTIFICATIONS_ERROR_ENUM_TITLES)
      .map(([key, value]) => `${value} (${key})`)
      .join(', '),
    example: NOTIFICATIONS_ERROR_ENUM_TITLES[NotificationsErrorEnum.COMMON],
  })
  override message: string;

  @ApiProperty({
    enum: NotificationsErrorEnum,
    enumName: 'NotificationsErrorEnum',
    example: NotificationsErrorEnum.COMMON,
  })
  code = NotificationsErrorEnum.COMMON;

  @ApiPropertyOptional({ type: NotificationsErrorMetadata, isArray: true })
  metadata?: NotificationsErrorMetadata[];

  constructor(
    message?: string | NotificationsErrorEnum,
    code?: NotificationsErrorEnum,
    metadata?: CvNotificationsError[]
  ) {
    const messageAsCode = Boolean(
      message &&
        Object.values(NotificationsErrorEnum).includes(
          message as NotificationsErrorEnum
        )
    );
    const preparedCode = messageAsCode
      ? (message as NotificationsErrorEnum)
      : code;
    const preparedMessage =
      messageAsCode && preparedCode
        ? NOTIFICATIONS_ERROR_ENUM_TITLES[preparedCode]
        : message;

    code = preparedCode || NotificationsErrorEnum.COMMON;
    message = preparedMessage || NOTIFICATIONS_ERROR_ENUM_TITLES[code];

    super(message);

    this.code = code;
    this.message = message;
    this.metadata =
      NotificationsErrorMetadata.fromClassValidatorNotificationsErrors(
        metadata
      );
  }
}
