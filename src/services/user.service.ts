import { PrismaClient } from "@prisma/client";
import { AppError } from "@/utils/appError";

const prisma = new PrismaClient();

export class UserService {
  async getAllUsers(companyId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    return prisma.user.findMany({
      where: { companyId },
      take: limit,
      skip,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getUserById(companyId: string, id: string) {
    const user = await prisma.user.findFirst({
      where: {
        id,
        companyId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  }

  async updateUser(
    companyId: string,
    id: string,
    data: Partial<{
      name: string;
      email: string;
      role: "ADMIN" | "USER";
    }>,
  ) {
    return prisma.user.updateMany({
      where: {
        id,
        companyId,
      },
      data,
    });
  }

  async deleteUser(companyId: string, id: string) {
    const result = await prisma.user.deleteMany({
      where: {
        id,
        companyId,
      },
    });

    if (result.count === 0) {
      throw new AppError("User not found", 404);
    }
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    role?: "ADMIN" | "USER";
    companyId: string;
  }) {
    return prisma.user.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
