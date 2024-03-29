import './utils/module-alias';

// import express, { Application } from 'express';
// import expressPino from 'express-pino-logger';
// import { Server } from '@overnightjs/core';
// import swaggerUI from 'swagger-ui-express';
// import cors from 'cors';

// import { OpenApiValidator } from 'express-openapi-validator';
// import { OpenAPIV3 } from 'express-openapi-validator/dist/framework/types';

// import config from 'config';

// import { ForecastController } from '@src/controllers/forecast';
// import { BeachesController } from '@src/controllers/beaches';
// import { UsersController } from '@src/controllers/users';

// import logger from '@src/logger';
// import * as database from '@src/database';
// import apiScheme from '@src/api.schema.json';
// import { apiErrorValidator } from '@src/middlewares/api-error-validator';

import { Server } from '@overnightjs/core';
import express, { Application } from 'express';
import expressPino from 'express-pino-logger';
import cors from 'cors';
import swaggerUI from 'swagger-ui-express';
import { OpenApiValidator } from 'express-openapi-validator';
import { OpenAPIV3 } from 'express-openapi-validator/dist/framework/types';
import { ForecastController } from './controllers/forecast';
import * as database from '@src/database';
import { BeachesController } from './controllers/beaches';
import { UsersController } from './controllers/users';
import logger from './logger';
import apiSchema from './api-schema.json';
import { apiErrorValidator } from './middlewares/api-error-validator';

export class SetupServer extends Server {
  constructor(private port: number = 3000) {
    super();
  }

  public async init(): Promise<void> {
    // initialaze setup express
    this.setupExpress();

    // initialize documentation setup with swagger
    await this.docsSetup();

    // initialize setup controllers
    this.setupControllers();

    // initialize database setup with mongodb
    await this.databaseSetup();

    // initialize setup error handlers
    this.setupErrorHandlers();
  }

  private setupExpress(): void {
    this.app.use(express.json());
    this.app.use(expressPino({ logger }));
    this.app.use(cors({ origin: '*' }));
  }

  private setupErrorHandlers(): void {
    this.app.use(apiErrorValidator);
  }

  private setupControllers(): void {
    const forecastController = new ForecastController();
    const beachesController = new BeachesController();
    const usersController = new UsersController();

    this.addControllers([
      forecastController,
      beachesController,
      usersController,
    ]);
  }

  private async docsSetup(): Promise<void> {
    this.app.use('/docs', swaggerUI.serve, swaggerUI.setup(apiSchema));

    await new OpenApiValidator({
      apiSpec: apiSchema as OpenAPIV3.Document,
      validateRequests: true,
      validateResponses: true,
    }).install(this.app);
  }

  private async databaseSetup(): Promise<void> {
    await database.connect();
  }

  public start(): void {
    this.app.listen(this.port, () => {
      logger.info('Server listening of port: ' + this.port);
    });
  }

  public async close(): Promise<void> {
    await database.close();
  }

  public getApp(): Application {
    return this.app;
  }
}
