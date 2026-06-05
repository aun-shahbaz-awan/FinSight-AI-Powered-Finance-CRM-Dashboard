-- CreateEnum
CREATE TYPE "AiActionType" AS ENUM ('TICKET_SUMMARY', 'SUPPORT_REPLY', 'CLIENT_RISK_SUMMARY', 'DASHBOARD_QA');

-- CreateTable
CREATE TABLE "AiLog" (
    "id" TEXT NOT NULL,
    "action" "AiActionType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AiLog" ADD CONSTRAINT "AiLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
