# TNO SSI Service Provider Backend

This repository contains the backend for the SSI Service created by TNO.
It should be run in conjunction with the other necessary services
(frontend, irma, db, etc.). Deployment configurations for running the
entire service are provided in a separate repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Migrations

We use the `typeorm` library for managing the database. A dev/prod and
nest/typeorm-cli compatible ormconfig can be found in
`src/ormconfig.ts`. Some helper scripts have been defined in
`package.js`.

```bash
# run typeorm command
$ npm run typeorm <your command>

# create new migration
$ npm run typeorm:migrate <migration name (PascalCase)>

# run migrations
$ npm run typeorm:run
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

Nest is [MIT licensed](LICENSE).
