import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // ── CORS ──────────────────────────────────────────────────
  app.enableCors({
    origin: [
      configService.get<string>('app.frontendUrl', 'http://localhost:5173'),
      'http://localhost:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['*'],
    credentials: true,
  });

  // ── Global Validation Pipe ─────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // ── Global Exception Filter ────────────────────────────────
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ── Swagger / OpenAPI ─────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('AssetFlow API')
    .setDescription('Enterprise Asset Management System — NestJS + MongoDB')
    .setVersion('2.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // ── Start ─────────────────────────────────────────────────
  const port = configService.get<number>('port', 3000);
  await app.listen(port);
  console.log(`\n🚀 AssetFlow NestJS API running at: http://localhost:${port}`);
  console.log(`📖 Swagger UI: http://localhost:${port}/api-docs\n`);
}

bootstrap();
