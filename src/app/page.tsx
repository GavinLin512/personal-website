import prisma from '@/lib/prisma'
import type { User } from '@prisma/client'
import Navigation from '@/components/navigation'


const users = await prisma.user.findMany();


export default async function Home() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background flex flex-col items-center justify-center -mt-16">
        <h1 className="text-4xl font-bold mb-8 font-[family-name:var(--font-geist-sans)] text-[#333333]">
          Superblog
        </h1>
        <ol className="list-decimal list-inside font-[family-name:var(--font-geist-sans)]">
          {users.map((user: User) => (
            <li key={user.id} className="mb-2">
              {user.name} {user.email}
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
