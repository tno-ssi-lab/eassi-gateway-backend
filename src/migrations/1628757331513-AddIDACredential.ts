import {MigrationInterface, QueryRunner} from "typeorm";

export class AddIDACredential1628757331513 implements MigrationInterface {
    name = 'AddIDACredential1628757331513'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ida_credential_type" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "context" character varying NOT NULL, "attributes" jsonb, CONSTRAINT "UQ_8d0b1682d17450d32b86f9bd36c" UNIQUE ("context"), CONSTRAINT "PK_b4a99b166fe7a5fd530e9c74a15" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ida_credential_request_token" ("id" SERIAL NOT NULL, "transactionId" character varying NOT NULL, "verifyRequestId" integer, CONSTRAINT "PK_9d8b93a9730c9aa666a167e83e6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_da4479a58ebc55e96368259779" ON "ida_credential_request_token" ("transactionId", "verifyRequestId") `);
        await queryRunner.query(`ALTER TABLE "credential_type" ADD "idaTypeId" integer`);
        await queryRunner.query(`ALTER TABLE "master_keys" DROP COLUMN "timestamp"`);
        await queryRunner.query(`ALTER TABLE "master_keys" ADD "timestamp" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "credential_type" ADD CONSTRAINT "FK_d225565823d407624be76d1204d" FOREIGN KEY ("idaTypeId") REFERENCES "ida_credential_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ida_credential_request_token" ADD CONSTRAINT "FK_2e0e677c64a1c40b7a20157f72d" FOREIGN KEY ("verifyRequestId") REFERENCES "credential_verify_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ida_credential_request_token" DROP CONSTRAINT "FK_2e0e677c64a1c40b7a20157f72d"`);
        await queryRunner.query(`ALTER TABLE "credential_type" DROP CONSTRAINT "FK_d225565823d407624be76d1204d"`);
        await queryRunner.query(`ALTER TABLE "master_keys" DROP COLUMN "timestamp"`);
        await queryRunner.query(`ALTER TABLE "master_keys" ADD "timestamp" bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "credential_type" DROP COLUMN "idaTypeId"`);
        await queryRunner.query(`DROP INDEX "IDX_da4479a58ebc55e96368259779"`);
        await queryRunner.query(`DROP TABLE "ida_credential_request_token"`);
        await queryRunner.query(`DROP TABLE "ida_credential_type"`);
    }

}
