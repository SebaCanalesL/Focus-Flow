

"use client";

import { useState, useEffect } from "react";
import { useAppData } from "@/contexts/app-provider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, sendPasswordResetEmail, updateProfile, deleteUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";

const AvatarPlaceholders = [
    {
      id: "avatar-1",
      description: "Avatar Rosa",
      imageUrl: "/avatars/spark1-rosa.png",
      imageHint: "rosa"
    },
    {
      id: "avatar-2",
      description: "Avatar Verde",
      imageUrl: "/avatars/spark2-verde.png",
      imageHint: "verde"
    },
    {
      id: "avatar-3",
      description: "Avatar Naranjo",
      imageUrl: "/avatars/spark3-naranjo.png",
      imageHint: "naranjo"
    },
    {
      id: "avatar-4",
      description: "Avatar Azul",
      imageUrl: "/avatars/spark4-azul.png",
      imageHint: "azul"
    }
]


export default function ProfilePage() {
  const { user, setUser, loading, birthday, setBirthday: setAppBirthday } = useAppData();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [birthdayState, setBirthdayState] = useState<Date | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setPhotoURL(user.photoURL || "");
    }
    if (birthday) {
        setBirthdayState(new Date(birthday));
    }
  }, [user, birthday]);


  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      await updateProfile(user, {
        displayName: displayName,
        photoURL: photoURL,
      });

      const updatedUser = { ...user, displayName, photoURL } as User;
      setUser(updatedUser);
      
      if(birthdayState) {
        setAppBirthday(birthdayState);
      }

      toast({
        title: "¡Perfil Actualizado!",
        description: "Tu información ha sido guardada exitosamente.",
      });
    } catch (error: any) {
      toast({
        title: "Error al actualizar",
        description: "No se pudo guardar la información. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) {
      toast({
        title: "Correo no encontrado",
        description: "No se pudo encontrar un correo para enviar el enlace.",
        variant: "destructive",
      });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast({
        title: "Correo de recuperación enviado",
        description: "Revisa tu bandeja de entrada para cambiar tu contraseña.",
      });
    } catch (error) {
       toast({
        title: "Error",
        description: "No se pudo enviar el correo de recuperación. Intenta más tarde.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      await deleteUser(user);
      toast({
        title: "Cuenta eliminada",
        description: "Tu cuenta ha sido eliminada permanentemente.",
      });
      router.push("/signup");
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        toast({
          title: "Se requiere re-autenticación",
          description: "Por seguridad, cierra sesión y vuelve a iniciarla antes de eliminar tu cuenta.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error al eliminar la cuenta",
          description: "No se pudo eliminar la cuenta. Intenta de nuevo.",
          variant: "destructive",
        });
      }
    }
  };


  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <div>No se ha encontrado un usuario.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Tu Perfil</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Foto de Perfil</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src={photoURL || undefined} alt={displayName || "Usuario"} />
              <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
            </Avatar>
            <div className="w-full space-y-2">
                <Label>Elige un avatar</Label>
                <div className="grid grid-cols-4 gap-2">
                    {AvatarPlaceholders.map(p => (
                        <button key={p.id} onClick={() => setPhotoURL(p.imageUrl)} className={cn("rounded-full overflow-hidden border-2 transition-all", photoURL === p.imageUrl ? "border-primary" : "border-transparent hover:border-primary/50")}>
                            <Image 
                                src={p.imageUrl} 
                                alt={p.description} 
                                width="150" 
                                height="150" 
                                data-ai-hint={p.imageHint}
                                className="aspect-square object-cover" />
                        </button>
                    ))}
                </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Información de la Cuenta</CardTitle>
            <CardDescription>
              Actualiza tu información de perfil aquí.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveChanges} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="display-name">Nombre de Usuario</Label>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Tu nombre"
                  className="sm:text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo</Label>
                <Input id="email" value={user.email || ""} disabled className="sm:text-sm" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="birthday">Fecha de nacimiento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal sm:text-sm",
                        !birthdayState && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {birthdayState ? format(birthdayState, "d 'de' MMMM, yyyy", { locale: es }) : <span>Elige una fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={birthdayState}
                      onSelect={setBirthdayState}
                      initialFocus
                      captionLayout="dropdown-buttons"
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
                  {isSaving ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Contraseña</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium">Cambiar Contraseña</p>
              <p className="text-sm text-muted-foreground">Te enviaremos un correo para que puedas cambiar tu contraseña.</p>
            </div>
            <Button variant="outline" onClick={handlePasswordReset} className="w-full sm:w-auto">Enviar Correo</Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-destructive">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6">
            <div>
              <p className="font-bold">Eliminar Cuenta</p>
              <p className="text-sm text-muted-foreground">
                Esta acción es permanente y no se puede deshacer. Se eliminarán todos tus datos.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full sm:w-auto">Eliminar Cuenta</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás absolutely seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente tu cuenta y borrará todos tus datos de nuestros servidores.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                    Sí, eliminar mi cuenta
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
