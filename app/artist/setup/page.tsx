import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Wallet, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useStore } from "@/lib/store"

export default function ArtistSetupPage() {
  const router = useRouter()
  const auth = useStore((state) => state.auth)
  const createArtistProfile = useStore((state) => state.createArtistProfile)
  const getUserArtistProfile = useStore((state) => state.getUserArtistProfile)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    walletAddress: auth.currentUser?.walletAddress || "",
  })

  useEffect(() => {
    if (!auth.isAuthenticated || !auth.currentUser || auth.currentUser.type !== "artist") {
      router.push("/")
      return
    }

    // Check if artist already has a profile
    const existingProfile = getUserArtistProfile(auth.currentUser.id)
    if (existingProfile) {
      router.push("/artist/dashboard")
      return
    }

    // Set default name from user
    setFormData((prev) => ({
      ...prev,
      name: auth.currentUser?.name || "",
    }))
  }, [auth, router, getUserArtistProfile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      if (!auth.currentUser) {
        throw new Error("User not authenticated")
      }

      createArtistProfile(auth.currentUser.id, {
        name: formData.name,
        bio: formData.bio,
        walletAddress: auth.currentUser.walletAddress,
      })

      setSuccess(true)
      setTimeout(() => {
        router.push("/artist/dashboard")
      }, 2000)
    } catch (error: any) {
      console.error("Error creating artist profile:", error)
      setError(error.message || "Failed to create artist profile")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const goBack = () => {
    router.push("/")
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-xl border-white/20 rounded-3xl">
          <CardContent className="pt-6 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Profile Created!</h3>
            <p className="text-slate-300 mb-6">Your artist profile has been set up successfully.</p>
            <p className="text-slate-400 text-sm">Redirecting to your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Button
            onClick={goBack}
            variant="outline"
            className="border-white/30 bg-white/10 hover:bg-white/20 text-white hover:text-white backdrop-blur-sm rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-3xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-white">Complete Your Artist Profile</CardTitle>
            <CardDescription className="text-slate-300 text-lg">
              Set up your performance details to start earning crypto tips
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Artist Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white font-medium">
                  Artist Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your stage name"
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl py-3 focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-white font-medium">
                  Bio (Optional)
                </Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell people about your art and style..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl focus:ring-2 focus:ring-violet-500"
                  rows={3}
                />
              </div>

              {/* Wallet Info */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <Wallet className="h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="text-white font-medium">Wallet Address</p>
                    <p className="text-slate-400 text-sm font-mono">
                      {auth.currentUser?.walletAddress.slice(0, 6)}...{auth.currentUser?.walletAddress.slice(-4)}
                    </p>
                  </div>
                </div>
                <p className="text-slate-400 text-xs mt-2">Tips will be sent directly to this wallet</p>
              </div>

              {error && (
                <Alert className="bg-red-500/10 border-red-500/20 rounded-xl">
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-semibold py-4 rounded-xl shadow-lg text-lg"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-5 w-5 mr-2" />
                )}
                Create Artist Profile
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
git 