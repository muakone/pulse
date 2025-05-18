import UserTypeSelection from "@/components/UserTypeSelection"

export default function SelectUserType() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Select User Type</h1>
      <UserTypeSelection />
    </main>
  )
}
