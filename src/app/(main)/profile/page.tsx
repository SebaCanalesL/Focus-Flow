'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import { useAppData } from "@/contexts/app-provider"
import { useRouter } from "next/navigation"
import { format, parseISO, isValid } from "date-fns"
import { es } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { User, sendPasswordResetEmail, updateProfile, deleteUser } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, updateDoc } from 'firebase/firestore'
import { Pencil, Save, CalendarIcon, User as UserIcon } from "lucide-react"
import { toast } from 'sonner'

const AvatarPlaceholders = [
    {
      id: "avatar-1",
      description: "Avatar Rosa",
      src: "/avatars/spark1-rosa.png",
    },
    {
      id: "avatar-2",
      description: "Avatar Verde",
      src: "/avatars/spark2-verde.png",
    },
    {
      id: "avatar-3",
      description: "Avatar Naranjo",
      src: "/avatars/spark3-naranjo.png",
    },
    {
      id: "avatar-4",
      description: "Avatar Azul",
      src: "/avatars/spark4-azul.png",
    },
  ]

export default function ProfilePage() {
  const { user, setUser, birthday, setBirthday } = useAppData()
  const router = useRouter()

  const [displayName, setDisplayName] = useState("")
  const [photoURL, setPhotoURL] = useState("")
  const [birthdayDate, setBirthdayDate] = useState<Date | undefined>()

  const [isEditingAvatar, setIsEditingAvatar] = useState(false)
  const [isSavingAvatar, setIsSavingAvatar] = useState(false)

  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingBirthday, setIsEditingBirthday] = useState(false)
  
  const [isSavingName, setIsSavingName] = useState(false)

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "")
      setPhotoURL(user.photoURL || "")
      if (birthday) {
        const parsedDate = parseISO(birthday)
        if (isValid(parsedDate)) {
          setBirthdayDate(parsedDate)
        } else {
          setBirthdayDate(undefined)
        }
      } else {
        setBirthdayDate(undefined)
      }
    }
  }, [user, birthday])

  const handleAvatarSelect = (src: string) => {
    setPhotoURL(src)
  }

  const handleAvatarSave = async () => {
    if (!user || !photoURL) return
    setIsSavingAvatar(true)
    const toastId = toast.loading("Actualizando avatar...")
    try {
      await updateProfile(user, { photoURL })
      await updateDoc(doc(db, 'users', user.uid), { photoURL })
      
      setUser({ ...user, photoURL })
      setIsEditingAvatar(false)
      toast.success("Avatar actualizado correctamente", { id: toastId })
    } catch (error) {
      console.error("Error updating avatar: ", error)
      toast.error("Error al actualizar el avatar", { id: toastId })
    } finally {
      setIsSavingAvatar(false)
    }
  }

  const handleSaveName = async () => {
    if (!user || !displayName.trim()) {
        toast.error("El nombre no puede estar vacío.")
        return
    }
    setIsSavingName(true)
    const toastId = toast.loading('Guardando nombre...')
    try {
      await updateProfile(user, { displayName })
      await updateDoc(doc(db, 'users', user.uid), { displayName })
      setUser({ ...user, displayName })
      setIsEditingName(false)
      toast.success('Nombre guardado', { id: toastId })
    } catch (error) {
      console.error("Error updating name:", error)
      toast.error('Error al guardar el nombre', { id: toastId })
    } finally {
      setIsSavingName(false)
    }
  }

  const handleBirthdaySave = async (date: Date | undefined) => {
    if (!date) return
    const toastId = toast.loading("Guardando fecha de nacimiento...")
    try {
      await setBirthday(date)
      setBirthdayDate(date)
      setIsEditingBirthday(false)
      toast.success("Fecha de nacimiento guardada", { id: toastId })
    } catch (error) {
        console.error("Error updating birthday: ", error)
        toast.error("Error al guardar la fecha", { id: toastId })
    }
  }

  const handlePasswordReset = async () => {
    if (user && user.email) {
      const toastId = toast.loading("Enviando correo de restablecimiento...")
      try {
        await sendPasswordResetEmail(auth, user.email)
        toast.success("Correo enviado. Revisa tu bandeja de entrada.", { id: toastId })
      } catch (error) {
        console.error("Error sending password reset email:", error)
        toast.error("Error al enviar el correo de restablecimiento.", { id: toastId })
      }
    }
  }

  const handleDeleteAccount = async () => {
    if (user) {
        const toastId = toast.loading("Eliminando tu cuenta...")
      try {
        await deleteUser(user)
        toast.success("Cuenta eliminada con éxito.", { id: toastId })
        router.push("/signup")
      } catch (error: any) {
        console.error("Error deleting account:", error)
        if (error.code === 'auth/requires-recent-login') {
            toast.error("Esta operación es sensible y requiere una nueva autenticación. Por favor, vuelve a iniciar sesión e inténtalo de nuevo.", { id: toastId, duration: 6000 })
        } else {
            toast.error("Error al eliminar la cuenta.", { id: toastId })
        }
      }
    }
  }

  if (!user) {
    return <div>Cargando...</div>
  }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Foto de perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {!isEditingAvatar && user.photoURL ? (
                    <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={user.photoURL} alt="User avatar" />
                        <AvatarFallback>{displayName ? displayName.charAt(0).toUpperCase() : <UserIcon />}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" onClick={() => setIsEditingAvatar(true)}>
                        Cambiar avatar
                    </Button>
                    </div>
                ) : (
                    <div>
                        <Label className="mb-2 block">Elige un avatar</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                            {AvatarPlaceholders.map((avatar) => (
                            <div
                                key={avatar.id}
                                className={`cursor-pointer rounded-lg border-4 ${photoURL === avatar.src ? "border-primary" : "border-transparent"}`}
                                onClick={() => handleAvatarSelect(avatar.src)}
                            >
                                <Image
                                    src={avatar.src}
                                    alt={avatar.description}
                                    width={100}
                                    height={100}
                                    className="rounded-md"
                                />
                            </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleAvatarSave} disabled={isSavingAvatar || !photoURL || photoURL === user.photoURL}>
                                {isSavingAvatar ? 'Guardando...' : 'Guardar Avatar'}
                            </Button>
                            {user.photoURL && (
                                <Button variant="ghost" onClick={() => {
                                    setIsEditingAvatar(false)
                                    setPhotoURL(user.photoURL || '')
                                }}>
                                    Cancelar
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información de la cuenta</CardTitle>
           <CardDescription>Actualiza tu información de perfil aquí.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Nombre de Usuario</Label>
            <div className="flex items-center gap-2">
              {isEditingName || !displayName ? (
                <>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={isSavingName}
                  />
                  <Button onClick={handleSaveName} size="icon" disabled={isSavingName}>
                    {isSavingName ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save className="h-4 w-4" />}
                  </Button>
                </>
              ) : (
                <p className="flex-grow text-muted-foreground text-sm py-2">{displayName}</p>
              )}
              {!isEditingName && displayName && (
                <Button onClick={() => setIsEditingName(true)} variant="ghost" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo</Label>
            <p className="text-muted-foreground text-sm">{user.email}</p>
          </div>

          <div className="space-y-2">
            <Label>Fecha de nacimiento</Label>
            <div className="flex items-center gap-2">
                {isEditingBirthday || !birthday ? (
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className="w-full justify-start text-left font-normal"
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {birthdayDate ? format(birthdayDate, 'PPP', { locale: es }) : <span>Elige una fecha</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={birthdayDate}
                                onSelect={(date) => handleBirthdaySave(date)}
                                captionLayout="dropdown-buttons"
                                fromYear={1920}
                                toYear={new Date().getFullYear()}
                                initialFocus
                            />
                        </PopoverContent>
                  </Popover>
                ) : (
                     <p className="flex-grow text-muted-foreground text-sm py-2">
                        {birthdayDate && isValid(birthdayDate) ? format(birthdayDate, "d 'de' MMMM, yyyy", { locale: es }) : ''}
                     </p>
                )}
                {!isEditingBirthday && birthday && (
                    <Button onClick={() => setIsEditingBirthday(true)} variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}
             </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Contraseña</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
            <Label>Cambiar Contraseña</Label>
            <CardDescription>
            Te enviaremos un correo para que puedas cambiar tu contraseña.
            </CardDescription>
            <Button onClick={handlePasswordReset} variant="outline">Enviar Correo</Button>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Eliminar Cuenta</CardTitle>
          <CardDescription>
          Esta acción es permanente y no se puede deshacer. Se eliminarán todos tus datos.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">Eliminar Cuenta</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente tu cuenta y todos tus datos de nuestros servidores.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">Confirmar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
