import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { VersionController } from './version.controller';

@Module({
  imports: [],
  controllers: [AppController, VersionController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
