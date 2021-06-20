import config from 'config';

import { SetupServer } from './server';
import logger from './logger';

enum ExitStatus {
  Failure = 1,
  Success = 0,
}

// Listen to unhandled rejection so as not to interrupt the process
process.on('unhandledRejection', (reason, promise): NodeJS.Process => {
  logger.error(
    `App exiting due to an unhandled promise: ${promise} and reason: ${reason}`
  );
  throw reason;
});

// Self invocked function to start and exit the app correctly
(async (): Promise<void> => {
  try {
    const server = new SetupServer(config.get('App.port'));
    await server.init();
    server.start();

    const exitSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];

    for (const signal of exitSignals) {
      process.on(signal, async () => {
        try {
          await server.close();
          logger.info(`App exited with sucess. Signal: ${signal}`);
          process.exit(ExitStatus.Success);
        } catch (error) {
          logger.error(`App exited with error: ${error}`);
          process.exit(ExitStatus.Failure);
        }
      });
    }
  } catch (error) {
    logger.error(`App exited with error: ${error}`);
    process.exit(ExitStatus.Failure);
  }
})();
