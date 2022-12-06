import { Test, TestingModule } from "@nestjs/testing";
import { PrismaClientModule } from "@site15/prisma/server";
import env from "env-var";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        PrismaClientModule.forRoot({
          databaseUrl: env.get("SERVER_POSTGRES_URL").required().asString(),
          logging: "long_queries",
          maxQueryExecutionTime: 5000,
        }),
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  describe("getData", () => {
    it('should return "Welcome to api!"', () => {
      const appController = app.get<AppController>(AppController);
      expect(appController.getData()).toEqual({
        message: "Welcome to api!",
      });
    });
  });
});
