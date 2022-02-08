import {MigrationInterface, QueryRunner} from "typeorm";

export class AddTrinsicCredentials1637332321307 implements MigrationInterface {
    name = 'AddTrinsicCredentials1637332321307'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "trinsic_schema" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "version" character varying NOT NULL, "attributeNames" text NOT NULL, "supportRevocation" boolean DEFAULT null, "trinsicSchemaId" character varying, "trinsicCredentialDefinitionId" character varying, "tag" character varying, CONSTRAINT "PK_7b023b837449d2d4d5e18bdab4e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "trinsic_invitation" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "connectionId" character varying NOT NULL, "multiParty" boolean NOT NULL, "connectionResponse" text NOT NULL, CONSTRAINT "UQ_40fe259c477478321ad3dd2d063" UNIQUE ("connectionId"), CONSTRAINT "PK_2a6e578529ac9bbd2bba63a14da" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "credential_type" ADD "trinsicSchemaId" integer`);
        await queryRunner.query(`ALTER TABLE "credential_type" ADD CONSTRAINT "FK_d9eef2098436bfd255e777e5bd1" FOREIGN KEY ("trinsicSchemaId") REFERENCES "trinsic_schema"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "credential_type" DROP CONSTRAINT "FK_d9eef2098436bfd255e777e5bd1"`);
        await queryRunner.query(`ALTER TABLE "credential_type" DROP COLUMN "trinsicSchemaId"`);
        await queryRunner.query(`DROP TABLE "trinsic_invitation"`);
        await queryRunner.query(`DROP TABLE "trinsic_schema"`);
    }

}
