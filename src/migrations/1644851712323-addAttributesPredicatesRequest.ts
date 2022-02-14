import {MigrationInterface, QueryRunner} from "typeorm";

export class addAttributesPredicatesRequest1644851712323 implements MigrationInterface {
    name = 'addAttributesPredicatesRequest1644851712323'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "trinsic_schema"."supportRevocation" IS NULL`);
        await queryRunner.query(`ALTER TABLE "trinsic_schema" ALTER COLUMN "supportRevocation" SET DEFAULT null`);
        await queryRunner.query(`COMMENT ON COLUMN "credential_verify_request"."attributes" IS NULL`);
        await queryRunner.query(`ALTER TABLE "credential_verify_request" ALTER COLUMN "attributes" SET DEFAULT array[]::text[]`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "credential_verify_request" ALTER COLUMN "attributes" SET DEFAULT ARRAY[]`);
        await queryRunner.query(`COMMENT ON COLUMN "credential_verify_request"."attributes" IS NULL`);
        await queryRunner.query(`ALTER TABLE "trinsic_schema" ALTER COLUMN "supportRevocation" DROP DEFAULT`);
        await queryRunner.query(`COMMENT ON COLUMN "trinsic_schema"."supportRevocation" IS NULL`);
    }

}
