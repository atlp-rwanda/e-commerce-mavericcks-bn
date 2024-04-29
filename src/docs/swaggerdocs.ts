import dotenv from 'dotenv';

dotenv.config();
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mavericks back-end API documentation',
      version: '1.0.0',
      description: 'this is a mavericks documentation for back-end APIs',
    },
    components: {
      securitySchemes: {},
    },
    servers: [
      {
        url: `${process.env.URL_HOST}`,
      },
    ],
  },
  schemes: ['http', 'https'],
  apis: ['./src/docs/*.yaml'],
};

export default options;
