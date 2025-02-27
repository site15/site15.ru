import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class NotificationsEventRecipientGroupIdExternalTenantIdUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  recipientGroupId!: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  externalTenantId!: string;
}
export class NotificationsEventRecipientUserIdExternalTenantIdUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  recipientUserId!: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  externalTenantId!: string;
}
export class NotificationsEventSenderUserIdExternalTenantIdUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  senderUserId!: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  externalTenantId!: string;
}
export class NotificationsEventSenderUserIdRecipientUserIdOperationNameTypeHtmlSubjectExternalTenantIdUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  senderUserId!: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  recipientUserId!: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  operationName!: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  type!: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  html!: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  subject!: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  externalTenantId!: string;
}

@ApiExtraModels(
  NotificationsEventRecipientGroupIdExternalTenantIdUniqueInputDto,
  NotificationsEventRecipientUserIdExternalTenantIdUniqueInputDto,
  NotificationsEventSenderUserIdExternalTenantIdUniqueInputDto,
  NotificationsEventSenderUserIdRecipientUserIdOperationNameTypeHtmlSubjectExternalTenantIdUniqueInputDto
)
export class ConnectNotificationsEventDto {
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  externalTenantId?: string;
  @ApiProperty({
    type: NotificationsEventRecipientGroupIdExternalTenantIdUniqueInputDto,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationsEventRecipientGroupIdExternalTenantIdUniqueInputDto)
  recipientGroupId_externalTenantId?: NotificationsEventRecipientGroupIdExternalTenantIdUniqueInputDto;
  @ApiProperty({
    type: NotificationsEventRecipientUserIdExternalTenantIdUniqueInputDto,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationsEventRecipientUserIdExternalTenantIdUniqueInputDto)
  recipientUserId_externalTenantId?: NotificationsEventRecipientUserIdExternalTenantIdUniqueInputDto;
  @ApiProperty({
    type: NotificationsEventSenderUserIdExternalTenantIdUniqueInputDto,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationsEventSenderUserIdExternalTenantIdUniqueInputDto)
  senderUserId_externalTenantId?: NotificationsEventSenderUserIdExternalTenantIdUniqueInputDto;
  @ApiProperty({
    type: NotificationsEventSenderUserIdRecipientUserIdOperationNameTypeHtmlSubjectExternalTenantIdUniqueInputDto,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(
    () =>
      NotificationsEventSenderUserIdRecipientUserIdOperationNameTypeHtmlSubjectExternalTenantIdUniqueInputDto
  )
  senderUserId_recipientUserId_operationName_type_html_subject_externalTenantId?: NotificationsEventSenderUserIdRecipientUserIdOperationNameTypeHtmlSubjectExternalTenantIdUniqueInputDto;
}
