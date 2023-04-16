import { Db, MongoClient } from "mongodb";
import { Prisma, PrismaClient } from "@prisma/client";

export async function connectMongoDB(): Promise<Db> {
  return (await MongoClient.connect("mongodb://127.0.0.1:27017/")).db(
    "hiscores"
  );
}

export async function ConnectSqlLite(): Promise<
  PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >
> {
  return new PrismaClient();
}
