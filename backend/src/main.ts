import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const isProduction = process.env.NODE_ENV === 'production';
  const port = process.env.PORT || 3000;
  const urlProduction = 'https://climatechange-9ftw.onrender.com';

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Setup Swagger/OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Climate Change API')
    .setDescription('Climate control system API - Smart air conditioner management')
    .setVersion('1.0.0')
    .setContact(
      'Climate Control Team',
      'https://climatechange-9ftw.onrender.com/',
      'support@climatechange.app',
    )
    // .addBearerAuth(
    //   {
    //     type: 'http',
    //     scheme: 'bearer',
    //     bearerFormat: 'JWT',
    //   },
    //   'access-token',
    // )
    .addTag('Health', 'Health check endpoints')
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Devices', 'Air conditioner device management')
    .addTag('Rooms', 'Room management')
    .addTag('Schedules', 'Schedule management')
    .addTag('Activity Log', 'Activity log endpoints')
    .addTag('Brands', 'Brand management')
    .addTag('AI', 'AI recommendations')
    .setLicense('MIT', '');

  // Add servers for different environments
  if (isProduction) {
    swaggerConfig.addServer('https://climatechange-9ftw.onrender.com', 'Production');
    swaggerConfig.addServer('http://localhost:3000', 'Development');
  } else {
    swaggerConfig.addServer(`http://localhost:${port}`, 'Development');
    swaggerConfig.addServer('https://climatechange-9ftw.onrender.com', 'Production');
  }

  const document = SwaggerModule.createDocument(app, swaggerConfig.build());
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayOperationId: true,
      docExpansion: 'list',
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
    },
    customCss: `
      .swagger-ui .topbar { display: none; }
    `,
    customSiteTitle: 'Climate Change API Docs',
  });

  app.enableCors({
    origin: isProduction 
      ? ['https://climatechange-9ftw.onrender.com', 'https://climatechange.app' , 'https://climatechange-1.onrender.com','http://localhost:8081']
      : '*',
    credentials: true,
  });

  app.useWebSocketAdapter(new IoAdapter(app));

  await app.listen(port,"0.0.0.0");
  const appUrl = await app.getUrl();
  const swaggerUrl = isProduction ? `${urlProduction}/api` : `${appUrl}/api`;
  
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║          Climate Change API Server Started                ║
╠═══════════════════════════════════════════════════════════╣
║ 🌍 Server URL: ${(isProduction ? urlProduction : appUrl).padEnd(47)} ║
║ 📚 Swagger UI: ${swaggerUrl.padEnd(47)} ║
║ 🔧 Environment: ${(isProduction ? 'PRODUCTION' : 'DEVELOPMENT').padEnd(43)} ║
║ 📝 Node Version: ${process.version.padEnd(43)} ║
╚═══════════════════════════════════════════════════════════╝
  `);
}
bootstrap();
