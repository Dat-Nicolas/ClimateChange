-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "ACStatus" AS ENUM ('ON', 'OFF');

-- CreateEnum
CREATE TYPE "ACMode" AS ENUM ('COOL', 'DRY', 'FAN', 'AUTO');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "ButtonCode" AS ENUM ('POWER_ON', 'POWER_OFF', 'TEMP_17', 'TEMP_18', 'TEMP_19', 'TEMP_20', 'TEMP_21', 'TEMP_22', 'TEMP_23', 'TEMP_24', 'TEMP_25', 'TEMP_26', 'TEMP_27', 'TEMP_28', 'TEMP_29', 'TEMP_30');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "currentPeople" INTEGER NOT NULL DEFAULT 0,
    "currentTemperature" DOUBLE PRECISION NOT NULL DEFAULT 26,
    "minPeopleToTurnOn" INTEGER NOT NULL DEFAULT 5,
    "minTempToTurnOn" DOUBLE PRECISION NOT NULL DEFAULT 28,
    "peoplePerAC" INTEGER NOT NULL DEFAULT 10,
    "defaultTemp" DOUBLE PRECISION NOT NULL DEFAULT 25,
    "autoMode" BOOLEAN NOT NULL DEFAULT true,
    "startTime" TEXT NOT NULL DEFAULT '08:00',
    "endTime" TEXT NOT NULL DEFAULT '18:00',
    "acAutoControlEnabled" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AirConditioner" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "status" "ACStatus" NOT NULL DEFAULT 'OFF',
    "currentTemp" DOUBLE PRECISION NOT NULL DEFAULT 26,
    "mode" "ACMode" NOT NULL DEFAULT 'COOL',
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AirConditioner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IRButton" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "buttonName" "ButtonCode" NOT NULL,
    "irCode" TEXT NOT NULL,
    "irName" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IRButton_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensorLog" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "peopleCount" INTEGER NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SensorLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceLog" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "period" INTEGER NOT NULL,
    "count" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Room_userId_idx" ON "Room"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE INDEX "AirConditioner_brandId_idx" ON "AirConditioner"("brandId");

-- CreateIndex
CREATE INDEX "AirConditioner_roomId_idx" ON "AirConditioner"("roomId");

-- CreateIndex
CREATE INDEX "IRButton_brandId_idx" ON "IRButton"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "IRButton_brandId_buttonName_key" ON "IRButton"("brandId", "buttonName");

-- CreateIndex
CREATE INDEX "SensorLog_roomId_timestamp_idx" ON "SensorLog"("roomId", "timestamp");

-- CreateIndex
CREATE INDEX "ActivityLog_roomId_timestamp_idx" ON "ActivityLog"("roomId", "timestamp");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "Schedule_roomId_dayOfWeek_idx" ON "Schedule"("roomId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AirConditioner" ADD CONSTRAINT "AirConditioner_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AirConditioner" ADD CONSTRAINT "AirConditioner_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IRButton" ADD CONSTRAINT "IRButton_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensorLog" ADD CONSTRAINT "SensorLog_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceLog" ADD CONSTRAINT "AttendanceLog_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
