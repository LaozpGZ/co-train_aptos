import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): object {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'CoTrain AI Backend',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
    };
  }

  getVersion(): object {
    return {
      version: process.env.npm_package_version || '1.0.0',
      name: 'CoTrain AI Backend',
      description: 'Distributed AI Training Platform API',
      author: 'CoTrain Team',
      license: 'Apache-2.0',
    };
  }
}