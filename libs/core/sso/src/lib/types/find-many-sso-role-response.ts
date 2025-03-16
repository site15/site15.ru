import { ApiProperty } from '@nestjs/swagger';

export class FindManySsoRoleResponse {
  @ApiProperty({ type: () => [String] })
  userAvailableRoles!: string[];

  @ApiProperty({ type: () => [String] })
  userDefaultRoles!: string[];

  @ApiProperty({ type: () => [String] })
  adminDefaultRoles!: string[];
}
