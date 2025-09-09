#!/bin/bash
echo "Fixing TypeScript errors systematically..."
find pages/api -name "*.ts" -exec sed -i 's/import { prisma } from/import prisma from/g' {} \;
find pages/api -name "*.ts" -exec sed -i 's/import { authOptions } from/const authOptions = require/g' {} \;
find pages/api -name "*.ts" -exec sed -i 's/const authOptions = require \("[^"]*"\)/const authOptions = require(\1).default/g' {} \;
find pages -name "*.tsx" -exec sed -i 's/getServerSideProps(context)/getServerSideProps(context: any)/g' {} \;
find pages -name "*.tsx" -exec sed -i 's/session\.user\.role/(session.user as any)?.role/g' {} \;
find pages/api -name "*.ts" -exec sed -i 's/profile\.school/profile.schoolId/g' {} \;
find pages/api -name "*.ts" -exec sed -i '/import.*utils/d' {} \;
pnpm build
