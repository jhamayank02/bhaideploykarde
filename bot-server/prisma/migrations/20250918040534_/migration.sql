/*
  Warnings:

  - Added the required column `project_type` to the `project` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ProjectType" AS ENUM ('STATIC_WEBSITE', 'REACT_JS', 'VUE_JS', 'ANGULAR_JS');

-- AlterTable
ALTER TABLE "public"."project" ADD COLUMN     "project_type" "public"."ProjectType" NOT NULL;
