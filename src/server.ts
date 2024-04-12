import type { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import express from 'express';
import YAML from 'yamljs';
import swaggerUI from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import options from './docs/swaggerdocs';

const swaggerJsDocs = YAML.load('./src/docs/doc.yaml');
import databaseConnection from './database';
import User from './database/models/user';

dotenv.config();
const app: Application = express();
app.use(express.json());
const PORT = process.env.PORT ?? 3000;

app.get('/', (req: Request, res: Response): void => {
  res.send('Welcome at Mavericks E-commerce Website Apis');
});

// Route to add a new user
app.post('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract user data from request body
    const { firstName, lastName, email, password } = req.body;

    // Create a new user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
    });

    // Send success response with the newly created user
    res.status(201).json(newUser);
  } catch (error) {
    // Handle errors
    console.error('Error adding user:', error);
    res.status(500).send('Internal Server Error');
  }
});

databaseConnection();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const swaggerSpec = swaggerJsDoc(options);

app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
