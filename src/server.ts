// server.ts
import { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import swaggerUI from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import options from './docs/swaggerdocs';
import routes from './routes';
//import { validateCreateProfile, validateUpdateProfile } from './validations/profileValidation';
import profileRoutes from './routes/profileRoutes';
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
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Logging middleware
app.use(
  expressWinston.logger({
    winstonInstance: logger,
    statusLevels: true,
  })
);

// Profile routes
app.use('/profiles', profileRoutes);

// Error handling middleware for profile routes
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});

// Error handling middleware for other routes
app.use(
  expressWinston.errorLogger({
    winstonInstance: errorLogger,
  })
);

// Default route
app.get('/', (req: Request, res: Response): void => {
  logger.error('Testing logger');
  res.send('Welcome at Mavericks E-commerce Website Apis ');
});

// Route not found handler

app.all('*', (req: Request, res: Response): void => {
  res.status(404).json({ message: 'route not found' });
});

// Start server
const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

// Connect to database
databaseConnection();
