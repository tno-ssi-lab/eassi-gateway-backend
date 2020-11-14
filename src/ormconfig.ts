import { ConnectionOptions } from 'typeorm';

// See https://github.com/ambroiseRabier/typeorm-nestjs-migration-example for
// more info.

// Check typeORM documentation for more information.
const config: ConnectionOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [
    __dirname + '/**/*.entity{.ts,.js}',
    'node_modules/@jolocom/sdk-storage-typeorm/js/src/entities/*.js',
  ],

  // We are using migrations, synchronize should be set to false.
  synchronize: false,

  // Run migrations automatically,
  // you can disable this if you prefer running migration manually.
  migrationsRun: false,
  logging: true,
  logger: 'file',

  // Allow both start:prod and start:dev to use migrations
  // __dirname is either dist or src folder, meaning either
  // the compiled js in prod or the ts in dev.
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  cli: {
    // Location of migration should be inside src folder
    // to be compiled into dist/ folder.
    migrationsDir: 'src/migrations',
  },
};

export = config;
