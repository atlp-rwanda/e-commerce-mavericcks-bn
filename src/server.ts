import { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import swaggerUI from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import options from './docs/swaggerdocs';
import routes from './routes';
import passport from './config/passport';
import logger, { errorLogger } from './logs/config';
import expressWinston from 'express-winston';
import databaseConnection from './database';

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const swaggerSpec = swaggerJsDoc(options);
app.use('/api/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.use('/api', routes);

app.use(
  expressWinston.logger({
    winstonInstance: logger,
    statusLevels: true,
  })
);

app.get('/', (req: Request, res: Response): void => {
  logger.error('Testing logger');
  res.send('Welcome at Mavericks E-commerce Website Apis');
});

app.use(
  expressWinston.errorLogger({
    winstonInstance: errorLogger,
  })
);

app.all('*', (req: Request, res: Response): void => {
  res.status(404).json({ message: 'route not found' });
});

databaseConnection();

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
