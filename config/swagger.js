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
        url: 'http://gmo021.cansportsvg.com:49200',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
