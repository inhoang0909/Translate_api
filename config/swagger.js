import swaggerJSDoc from 'swagger-jsdoc';

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
        url: 'http://0.0.0.0:3000',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
