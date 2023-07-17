import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
export const authOptions: NextAuthOptions = {
  // https://next-auth.js.org/configuration/providers/oauth
  providers: [
    GoogleProvider({
      // clientId: process.env.GOOGLE_ID,
      clientId:
        '629586957237-6tdepdh786hh17srbt4li3kt0sc1s3g7.apps.googleusercontent.com',
      // clientSecret: process.env.GOOGLE_SECRET,
      clientSecret: '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',
    }),
  ],
  theme: {
    colorScheme: 'light',
  },
  callbacks: {
    async jwt({ token }) {
      token.userRole = 'admin';
      return token;
    },
  },
};

export default NextAuth(authOptions);
