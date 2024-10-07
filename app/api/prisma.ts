import { PrismaClient } from '@prisma/client';
// import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export { prisma };
