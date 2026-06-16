/*
  Warnings:

  - The values [VIDEO] on the enum `TypeMedia` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TypeMedia_new" AS ENUM ('PHOTO');
ALTER TABLE "public"."Media" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Media" ALTER COLUMN "type" TYPE "TypeMedia_new" USING ("type"::text::"TypeMedia_new");
ALTER TYPE "TypeMedia" RENAME TO "TypeMedia_old";
ALTER TYPE "TypeMedia_new" RENAME TO "TypeMedia";
DROP TYPE "public"."TypeMedia_old";
ALTER TABLE "Media" ALTER COLUMN "type" SET DEFAULT 'PHOTO';
COMMIT;
