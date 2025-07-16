import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      selectedHomeId?: number
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    selectedHomeId?: number
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    selectedHomeId?: number
  }
}
