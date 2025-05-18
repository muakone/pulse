import DynamicRegistrationForm from "@/components/DynamicRegistrationForm"

export default function Register({ params }: { params: { userType: string } }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Register as {params.userType}</h1>
      <DynamicRegistrationForm userType={params.userType} />
    </main>
  )
}
