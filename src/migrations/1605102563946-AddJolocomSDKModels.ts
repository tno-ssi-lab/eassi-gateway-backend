import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddJolocomSDKModels1605102563946 implements MigrationInterface {
  name = 'AddJolocomSDKModels1605102563946';

  // Note: timestamp columns have been manually changed to be bigint columns
  // instead of integer columns.

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "cache" ("key" character varying NOT NULL, "value" text NOT NULL, CONSTRAINT "PK_56570efc222b6e6be947abfc801" PRIMARY KEY ("key"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "encrypted_wallet" ("id" character varying(100) NOT NULL, "timestamp" bigint NOT NULL, "encryptedWallet" text NOT NULL, CONSTRAINT "PK_30233999fe323a170f00e847c52" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "signatures" ("id" SERIAL NOT NULL, "type" character varying NOT NULL, "created" TIMESTAMP NOT NULL, "creator" character varying NOT NULL, "nonce" character varying, "signatureValue" character varying NOT NULL, "verifiableCredentialId" character varying(50), CONSTRAINT "UQ_7ff99a380b1f16bea3dc1b31948" UNIQUE ("verifiableCredentialId", "signatureValue"), CONSTRAINT "PK_f56eb3cd344ce7f9ae28ce814eb" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "verifiable_credentials" ("@context" text NOT NULL, "id" character varying(50) NOT NULL, "type" text NOT NULL, "name" character varying(20), "issuer" character varying(75) NOT NULL, "issued" TIMESTAMP NOT NULL, "expires" TIMESTAMP, "subjectId" character varying(100), CONSTRAINT "PK_f9f30b23ff166f06fa2c43f35c1" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "credentials" ("id" SERIAL NOT NULL, "propertyName" character varying(50) NOT NULL, "propertyValue" character varying NOT NULL, "verifiableCredentialId" character varying(50), CONSTRAINT "UQ_4ec7ab0b5e94c73f31310fd16d0" UNIQUE ("verifiableCredentialId", "propertyName"), CONSTRAINT "PK_1e38bc43be6697cdda548ad27a6" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "event_log" ("id" character varying(100) NOT NULL, "eventStream" text NOT NULL, CONSTRAINT "PK_d8ccd9b5b44828ea378dd37e691" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "identityCache" ("key" character varying NOT NULL, "value" text NOT NULL, CONSTRAINT "PK_9d4eb14836e400bd0fef62891a4" PRIMARY KEY ("key"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "interaction_tokens" ("id" SERIAL NOT NULL, "nonce" character varying NOT NULL, "type" character varying NOT NULL, "issuer" character varying NOT NULL, "timestamp" bigint NOT NULL, "original" text NOT NULL, CONSTRAINT "PK_7d533d13bf1b60ddb10d5becef4" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "master_keys" ("encryptedEntropy" character varying(100) NOT NULL, "timestamp" bigint NOT NULL, CONSTRAINT "PK_3e5dfd8d379807b3431c1f7a3b5" PRIMARY KEY ("encryptedEntropy"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "settings" ("key" character varying NOT NULL, "value" text NOT NULL, CONSTRAINT "PK_c8639b7626fa94ba8265628f214" PRIMARY KEY ("key"))`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "signatures" ADD CONSTRAINT "FK_751b7e1a0b6996488fa3bf63ca2" FOREIGN KEY ("verifiableCredentialId") REFERENCES "verifiable_credentials"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "verifiable_credentials" ADD CONSTRAINT "FK_bc0241a547a24735bb29d43a0af" FOREIGN KEY ("subjectId") REFERENCES "encrypted_wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "credentials" ADD CONSTRAINT "FK_40a4c92d65d3c6cf200c360b1ce" FOREIGN KEY ("verifiableCredentialId") REFERENCES "verifiable_credentials"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "credentials" DROP CONSTRAINT "FK_40a4c92d65d3c6cf200c360b1ce"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "verifiable_credentials" DROP CONSTRAINT "FK_bc0241a547a24735bb29d43a0af"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "signatures" DROP CONSTRAINT "FK_751b7e1a0b6996488fa3bf63ca2"`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "settings"`, undefined);
    await queryRunner.query(`DROP TABLE "master_keys"`, undefined);
    await queryRunner.query(`DROP TABLE "interaction_tokens"`, undefined);
    await queryRunner.query(`DROP TABLE "identityCache"`, undefined);
    await queryRunner.query(`DROP TABLE "event_log"`, undefined);
    await queryRunner.query(`DROP TABLE "credentials"`, undefined);
    await queryRunner.query(`DROP TABLE "verifiable_credentials"`, undefined);
    await queryRunner.query(`DROP TABLE "signatures"`, undefined);
    await queryRunner.query(`DROP TABLE "encrypted_wallet"`, undefined);
    await queryRunner.query(`DROP TABLE "cache"`, undefined);
  }
}
