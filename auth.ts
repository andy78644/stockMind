import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import { authConfig } from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            name: "Email (Dev)",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "user@example.com" },
            },
            authorize: async (credentials) => {
                if (!credentials?.email) return null

                const email = credentials.email as string

                // Find or create user
                let user = await prisma.user.findUnique({
                    where: { email },
                })

                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            email,
                            name: email.split("@")[0],
                        },
                    })
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                }
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
            }
            return session;
        }
    }
})
