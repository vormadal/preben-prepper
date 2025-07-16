"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Users, Baby, Heart } from "lucide-react"
import { useCreateHome } from "@/hooks/useApi"

export default function Onboarding() {
  const [name, setName] = useState("")
  const [numberOfAdults, setNumberOfAdults] = useState(2)
  const [numberOfChildren, setNumberOfChildren] = useState(0)
  const [numberOfPets, setNumberOfPets] = useState(0)
  const router = useRouter()
  const { data: session } = useSession()
  const createHomeMutation = useCreateHome()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user?.id) {
      return
    }

    createHomeMutation.mutate({
      name,
      numberOfAdults,
      numberOfChildren,
      numberOfPets,
      ownerId: parseInt(session.user.id),
    }, {
      onSuccess: () => {
        router.push("/?message=Home setup completed successfully")
      }
    })
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] bg-gray-50 py-8">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Please sign in to continue.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)] bg-gray-50 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Home className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <CardTitle className="text-2xl">Welcome to Preben Prepper!</CardTitle>
          <CardDescription>
            Let's set up your home to get started with inventory management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Smith Family Home"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adults" className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  Adults
                </Label>
                <Input
                  id="adults"
                  type="number"
                  min="1"
                  max="20"
                  value={numberOfAdults}
                  onChange={(e) => setNumberOfAdults(parseInt(e.target.value) || 1)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="children" className="flex items-center gap-2 text-sm">
                  <Baby className="h-4 w-4" />
                  Children
                </Label>
                <Input
                  id="children"
                  type="number"
                  min="0"
                  max="20"
                  value={numberOfChildren}
                  onChange={(e) => setNumberOfChildren(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pets" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Pets
              </Label>
              <Input
                id="pets"
                type="number"
                min="0"
                max="20"
                value={numberOfPets}
                onChange={(e) => setNumberOfPets(parseInt(e.target.value) || 0)}
              />
            </div>

            {createHomeMutation.error && (
              <p className="text-red-500 text-sm">
                {createHomeMutation.error.message || "Failed to create home"}
              </p>
            )}
            
            <Button type="submit" className="w-full" disabled={createHomeMutation.isPending}>
              {createHomeMutation.isPending ? "Setting up your home..." : "Complete Setup"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Why do we need this information?</strong>
            </p>
            <p className="text-xs text-blue-700 mt-1">
              This helps us provide personalized recommendations for your household size and dietary needs.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
