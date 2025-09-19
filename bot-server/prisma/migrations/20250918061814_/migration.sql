-- AlterTable
ALTER TABLE "public"."project" ADD COLUMN     "build_command" TEXT,
ADD COLUMN     "build_directory" TEXT,
ADD COLUMN     "dependency_install_command" TEXT;
