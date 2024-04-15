import type { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import express from 'express';
import swaggerUI from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import options from './docs/swaggerdocs';
import logger, { errorLogger } from './logs/config';
import expressWinston from 'express-winston';

dotenv.config();
const app: Application = express();
const PORT = process.env.PORT ?? 3000;

/**
 * By placing express-winston middleware before defining routes,
 * we ensure that all HTTP requests and responses are logged
 * before they are handled by the application's routes.
 * This allows us to capture comprehensive logs of incoming
 * requests and outgoing responses for monitoring and debugging purposes. */
app.use(
  expressWinston.logger({
    winstonInstance: logger,
    statusLevels: true,
  })
);

app.get('/', (req: Request, res: Response): void => {
  logger.error('Hello World');
  res.send('Welcome at Mavericks E-commerce Website Apis');
});

/**
 * By placing express-winston middleware after defining routes,
 * we ensure that it captures any errors that occur during route handling.
 * This allows us to log detailed error information, including stack traces,
 * status codes, and error messages, for effective debugging and monitoring.
 */
app.use(
  expressWinston.errorLogger({
    winstonInstance: errorLogger,
  })
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const swaggerSpec = swaggerJsDoc(options);

app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
