import { Module } from "@nestjs/common";
import { PrismaClientModule } from "@site15/prisma/server";
import env from "env-var";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ContactTypeModule } from "./contact-type/contact-type.module";
import { VersionController } from "./version.controller";

@Module({
  imports: [
    PrismaClientModule.forRoot({
      databaseUrl: env.get("SERVER_POSTGRES_URL").required().asString(),
      logging: "long_queries",
      maxQueryExecutionTime: 5000,
    }),
    ContactTypeModule,
  ],
  controllers: [AppController, VersionController],
  providers: [AppService],
})
export class AppModule {}
