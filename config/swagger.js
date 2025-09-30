import swaggerJSDoc from 'swagger-jsdoc';
import dotenv from 'dotenv';
dotenv.config();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Translate API',
      version: '1.0.0',
      description: 'API documentation for the Translate System',
    },
    servers: [
      {
        url: process.env.SWAGGER_LOCAL_URL || 'http://0.0.0.0:5600',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
