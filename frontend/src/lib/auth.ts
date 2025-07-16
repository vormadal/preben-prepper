import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Call your backend API to authenticate
          const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3000'}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!response.ok) {
            return null
          }

          const data = await response.json()
          
          if (data.user) {
            // Fetch user's homes to get the default home
            const userId = data.user.id
            let selectedHomeId = data.user.defaultHomeId
            
            // If no default home is set, get the first available home
            if (!selectedHomeId) {
              try {
                const homesResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3000'}/api/homes?userId=${userId}`)
                if (homesResponse.ok) {
                  const homes = await homesResponse.json()
                  if (homes.length > 0) {
                    selectedHomeId = homes[0].id
                    
                    // Update user's default home if none was set
                    await fetch(`${process.env.BACKEND_URL || 'http://localhost:3000'}/api/users/${userId}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ defaultHomeId: selectedHomeId })
                    })
                  }
                }
              } catch (error) {
                console.error('Error fetching homes:', error)
              }
            }
            
            return {
              id: data.user.id.toString(),
              email: data.user.email,
              name: data.user.name,
              selectedHomeId,
            }
          }

          return null
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.selectedHomeId = user.selectedHomeId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.selectedHomeId = token.selectedHomeId as number
      }
      return session
    }
  },
  trustHost: true,
})
