import NextAuth from 'next-auth'
import SlackProvider from 'next-auth/providers/slack'

const handler = NextAuth({
  providers: [
    SlackProvider({
      clientId: process.env.SLACK_CLIENT_ID!,
      clientSecret: process.env.SLACK_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        (session.user as { slack_id?: string }).slack_id = token.sub
      }
      return session
    },
  },
})

export { handler as GET, handler as POST }
