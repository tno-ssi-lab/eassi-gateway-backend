import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndyInvitation1605282743753 implements MigrationInterface {
  name = 'AddIndyInvitation1605282743753';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "indy_invitation" ("id" SERIAL NOT NULL, "connectionId" character varying NOT NULL, "identifier" character varying NOT NULL, "connectionResponse" text NOT NULL, CONSTRAINT "UQ_c6e44ec097e20a641b498337246" UNIQUE ("identifier"), CONSTRAINT "PK_dd3b36632d872df064e9b44fc6a" PRIMARY KEY ("id"))`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "indy_invitation"`, undefined);
  }
}
