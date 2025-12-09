import {betterAuth} from 'better-auth';
import {prismaAdapter} from 'better-auth/adapters/prisma';
import prisma from './db.ts';
import { deviceAuthorization } from "better-auth/plugins";  

const {GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET} = process.env;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  basePath: '/api/auth',
  trustedOrigins: ['http://localhost:3000'],
   plugins: [
     deviceAuthorization({ 
      verificationUri: "/device", 
    }), 
  ],
  socialProviders: {
    github: {
      clientId: GITHUB_CLIENT_ID ?? '',
      clientSecret: GITHUB_CLIENT_SECRET ?? '',
    },
  },
});

