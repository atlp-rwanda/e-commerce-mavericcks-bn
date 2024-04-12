import type { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import express from 'express';
import YAML from 'yamljs';
import swaggerUI from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import options from './docs/swaggerdocs';

const swaggerJsDocs = YAML.load('./src/docs/doc.yaml');

dotenv.config();
const app: Application = express();
const PORT = process.env.PORT ?? 3000;

app.get('/', (req: Request, res: Response): void => {
  res.send('Welcome at Mavericks E-commerce Website Apis');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const swaggerSpec = swaggerJsDoc(options);

app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
