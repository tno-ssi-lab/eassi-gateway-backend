import {MigrationInterface, QueryRunner} from "typeorm";

export class Initial1605095105834 implements MigrationInterface {
    name = 'Initial1605095105834'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "jolocom_wallet" ("id" SERIAL NOT NULL, "encryptedSeedHex" character varying, "password" character varying NOT NULL, "did" character varying, "organizationId" integer, CONSTRAINT "REL_5b04f5e5905ad4174db9c8322e" UNIQUE ("organizationId"), CONSTRAINT "PK_d2e402cf91b917ae63abeee336e" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "jolocom_credential_request_token" ("id" SERIAL NOT NULL, "nonce" character varying NOT NULL, "token" text NOT NULL, "verifyRequestId" integer, CONSTRAINT "PK_6f4cbfc35836551a184df010d88" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_f28a7872b43e867bbb3c055eb8" ON "jolocom_credential_request_token" ("nonce", "verifyRequestId") `, undefined);
        await queryRunner.query(`CREATE TABLE "credential_verify_request" ("id" SERIAL NOT NULL, "callbackUrl" character varying NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "jwtId" character varying NOT NULL, "hash" character varying NOT NULL, "typeId" integer, "requestorId" integer, CONSTRAINT "PK_7ada4d13f5143dd56068a91d84c" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "credential_issue_request" ("id" SERIAL NOT NULL, "callbackUrl" character varying NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "data" text NOT NULL, "jwtId" character varying NOT NULL, "hash" character varying NOT NULL, "typeId" integer, "requestorId" integer, CONSTRAINT "PK_16d7cdd15799e68d4f6ca4cf1d2" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "organization" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "sharedSecret" character varying NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), CONSTRAINT "PK_472c1f99a32def1b0abb219cd67" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "jolocom_credential_type" ("id" SERIAL NOT NULL, "type" character varying NOT NULL, "name" character varying NOT NULL, "context" text NOT NULL, "claimInterface" text NOT NULL, CONSTRAINT "UQ_c9af7b2d99cd12084a1bd0fab8d" UNIQUE ("type"), CONSTRAINT "PK_86e5cc7efc5d186d4f1a6088991" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "credential_type" ("id" SERIAL NOT NULL, "type" character varying NOT NULL, "irmaType" character varying, "organizationId" integer, "jolocomTypeId" integer, "indySchemaId" integer, CONSTRAINT "PK_adccf1423100a19314d510b80f5" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "indy_schema" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "version" character varying NOT NULL, "attributes" text NOT NULL, "indySchemaId" character varying, "indyCredentialDefinitionId" character varying, CONSTRAINT "PK_fa67918005f50776e1b28ac2bcd" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "jolocom_wallet" ADD CONSTRAINT "FK_5b04f5e5905ad4174db9c8322ea" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "jolocom_credential_request_token" ADD CONSTRAINT "FK_9d7f1672e8a73fcf4e338c37771" FOREIGN KEY ("verifyRequestId") REFERENCES "credential_verify_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "credential_verify_request" ADD CONSTRAINT "FK_10a3290ab5d101e87d0f50af394" FOREIGN KEY ("typeId") REFERENCES "credential_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "credential_verify_request" ADD CONSTRAINT "FK_7c2edd3d7714b8cfa59b0f83f89" FOREIGN KEY ("requestorId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "credential_issue_request" ADD CONSTRAINT "FK_827886b1d17a76614e4ecf685b3" FOREIGN KEY ("typeId") REFERENCES "credential_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "credential_issue_request" ADD CONSTRAINT "FK_e638a364ae26c2ccc02194f9136" FOREIGN KEY ("requestorId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "credential_type" ADD CONSTRAINT "FK_c6b1daac1d32830ff85259c9d8c" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "credential_type" ADD CONSTRAINT "FK_2ca197641158e671646307b1936" FOREIGN KEY ("jolocomTypeId") REFERENCES "jolocom_credential_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "credential_type" ADD CONSTRAINT "FK_8e8d59e1b0573f8f676f6e6fba3" FOREIGN KEY ("indySchemaId") REFERENCES "indy_schema"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "credential_type" DROP CONSTRAINT "FK_8e8d59e1b0573f8f676f6e6fba3"`, undefined);
        await queryRunner.query(`ALTER TABLE "credential_type" DROP CONSTRAINT "FK_2ca197641158e671646307b1936"`, undefined);
        await queryRunner.query(`ALTER TABLE "credential_type" DROP CONSTRAINT "FK_c6b1daac1d32830ff85259c9d8c"`, undefined);
        await queryRunner.query(`ALTER TABLE "credential_issue_request" DROP CONSTRAINT "FK_e638a364ae26c2ccc02194f9136"`, undefined);
        await queryRunner.query(`ALTER TABLE "credential_issue_request" DROP CONSTRAINT "FK_827886b1d17a76614e4ecf685b3"`, undefined);
        await queryRunner.query(`ALTER TABLE "credential_verify_request" DROP CONSTRAINT "FK_7c2edd3d7714b8cfa59b0f83f89"`, undefined);
        await queryRunner.query(`ALTER TABLE "credential_verify_request" DROP CONSTRAINT "FK_10a3290ab5d101e87d0f50af394"`, undefined);
        await queryRunner.query(`ALTER TABLE "jolocom_credential_request_token" DROP CONSTRAINT "FK_9d7f1672e8a73fcf4e338c37771"`, undefined);
        await queryRunner.query(`ALTER TABLE "jolocom_wallet" DROP CONSTRAINT "FK_5b04f5e5905ad4174db9c8322ea"`, undefined);
        await queryRunner.query(`DROP TABLE "indy_schema"`, undefined);
        await queryRunner.query(`DROP TABLE "credential_type"`, undefined);
        await queryRunner.query(`DROP TABLE "jolocom_credential_type"`, undefined);
        await queryRunner.query(`DROP TABLE "organization"`, undefined);
        await queryRunner.query(`DROP TABLE "credential_issue_request"`, undefined);
        await queryRunner.query(`DROP TABLE "credential_verify_request"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_f28a7872b43e867bbb3c055eb8"`, undefined);
        await queryRunner.query(`DROP TABLE "jolocom_credential_request_token"`, undefined);
        await queryRunner.query(`DROP TABLE "jolocom_wallet"`, undefined);
    }

}
