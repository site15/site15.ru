import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SendInvitationLinksArgs {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  emails!: string;
}
