import NextAuth, { NextAuthOptions, User } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
// import { Account } from 'next-auth';
import { JWT } from 'next-auth/jwt';

const GOOGLE_AUTHORIZATION_URL =
  'https://accounts.google.com/o/oauth2/v2/auth?' +
  new URLSearchParams({
    prompt: 'consent',
    access_type: 'offline',
    response_type: 'code',
  });

const clientId = process.env.GOOGLE_ID || '';
const clientSecret = process.env.GOOGLE_SECRET || '';

async function refreshAccessToken(token: any) {
  try {
    console.log('this is the token', token);
    const url =
      'https://oauth2.googleapis.com/token?' +
      new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
      });

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    console.log(error);

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const authOptions: NextAuthOptions = {
  // https://next-auth.js.org/configuration/providers/oauth
  providers: [
    GoogleProvider({
      clientId,
      clientSecret,

      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope:
            'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar',
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  theme: {
    colorScheme: 'dark',
  },
  events: {
    signIn(message) {
      // console.log('signin message', message);
    },
  },
  session: {
    strategy: 'jwt',
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      console.log('this is user in the jwt callback', user);
      if (account && user) {
        console.log(
          'This is the account, this is where we hope the refresh token is',
          account
        );
        const expiryTime = account.expires_at || new Date().getTime();
        return {
          // accessToken: account.accessToken,
          accessToken: account.access_token,
          accessTokenExpires: Date.now() + expiryTime * 1000,
          refreshToken: account.refresh_token,
          user,
        };
      }
      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as any)) {
        return token;
      }
      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },

    async session({ session, token }: any) {
      console.log('this is session inside', session);
      console.log('this is token inside session', token);
      if (token) {
        // session.user = token.user || session.user;
        session.user = token.user;
        session.accessToken = token.accessToken;
        session.error = token.error;
      }
      return session;
    },
    // async jwt({ token, user, account, profile }) {
    //   token.userRole = 'admin';
    //   if (account) {
    //     token.accessToken = account.access_token;
    //     token.id = user.id;
    //   }
    //   return token;
    // },
  },
};

export default NextAuth(authOptions);
