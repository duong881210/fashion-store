import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import connectDB from '@/server/db';
import { User } from '@/server/db/models/User';
import { sendEmail, welcomeEmailTemplate } from '@/lib/email';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        await connectDB();
        
        const user = await User.findOne({ email: credentials.email }).select('+password');
        
        if (!user || !user.password) {
          throw new Error('Invalid email or password');
        }

        const isPasswordMatch = await user.comparePassword(credentials.password as string);

        if (!isPasswordMatch) {
          throw new Error('Invalid email or password');
        }

        if (!user.isActive) {
          throw new Error('Account is inactive');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.avatar,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === 'google' && user?.email) {
        await connectDB();
        let dbUser = await User.findOne({ email: user.email });
        if (!dbUser) {
          dbUser = await User.create({
            name: user.name || 'Google User',
            email: user.email,
            avatar: user.image || undefined,
            role: 'customer',
            isActive: true,
          });

          // Send welcome email (fire-and-forget)
          sendEmail(
            dbUser.email,
            'Chào mừng bạn đến với Fashion Store!',
            welcomeEmailTemplate({ customerName: dbUser.name })
          ).catch((err) => console.error('[Email Trigger Error in Google Sign-In]', err));
        }
        token.id = dbUser._id.toString();
        token.role = dbUser.role;
        token.picture = dbUser.avatar;
      } else if (user) {
        token.id = user.id;
        token.role = user.role;
        token.picture = (user as any).image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'customer' | 'admin';
        session.user.image = token.picture as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt'
  }
});
