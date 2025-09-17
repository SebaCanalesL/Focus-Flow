

"use client";

import { useState, useEffect } from "react";
import { useAppData } from "@/contexts/app-provider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format, parse } from "date-fns";
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
import { Pencil } from "lucide-react";

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
  const [birthdayInput, setBirthdayInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingBirthday, setIsEditingBirthday] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setPhotoURL(user.photoURL || "");
    }
    if (birthday) {
      try {
        const date = parse(birthday, 'yyyy-MM-dd', new Date());
        setBirthdayInput(format(date, 'dd/MM/yyyy'));
        setIsEditingBirthday(false);
      } catch (e) {
        setBirthdayInput(birthday); // fallback to raw value if parsing fails
        setIsEditingBirthday(true);
      }
    } else {
        setBirthdayInput("");
        setIsEditingBirthday(true);
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
  
  const handleBirthdayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 2) {
      value = value.slice(0,2) + '/' + value.slice(2);
    }
    if (value.length > 5) {
      value = value.slice(0,5) + '/' + value.slice(5,9);
    }
    setBirthdayInput(value);
  }

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
      
      let birthdayToSave: Date | undefined = undefined;
      if (birthdayInput) {
        const dateParts = birthdayInput.split('/');
        if (dateParts.length === 3) {
          const day = parseInt(dateParts[0], 10);
          const month = parseInt(dateParts[1], 10);
          const year = parseInt(dateParts[2], 10);

          if (day < 1 || day > 31) {
            toast({ title: "Día inválido", description: "El día debe estar entre 1 y 31.", variant: "destructive" });
            setIsSaving(false);
            return;
          } else if (month < 1 || month > 12) {
            toast({ title: "Mes inválido", description: "El mes debe estar entre 1 y 12.", variant: "destructive" });
            setIsSaving(false);
            return;
          } else if (year < 1900 || dateParts[2].length !== 4) {
            toast({ title: "Año inválido", description: "El año debe ser de 4 dígitos y mayor o igual a 1900.", variant: "destructive" });
            setIsSaving(false);
            return;
          } else {
             try {
                const parsedDate = parse(birthdayInput, 'dd/MM/yyyy', new Date());
                if (!isNaN(parsedDate.getTime())) {
                  birthdayToSave = parsedDate;
                } else {
                   toast({ title: "Fecha de nacimiento inválida", description: "La fecha no es válida. Por favor, revísala.", variant: "destructive" });
                   setIsSaving(false);
                   return;
                }
             } catch (error) {
                 toast({ title: "Error en fecha", description: "El formato de la fecha no es correcto.", variant: "destructive" });
                 setIsSaving(false);
                 return;
             }
          }
        } else if (birthdayInput.length > 0) {
           toast({ title: "Formato incorrecto", description: "Por favor usa el formato DD/MM/AAAA.", variant: "destructive" });
           setIsSaving(false);
           return;
        }
      }

      setAppBirthday(birthdayToSave);
      
      toast({
        title: "¡Perfil Actualizado!",
        description: "Tu información ha sido guardada exitosamente.",
      });

      if (birthdayToSave || !birthdayInput) {
        setIsEditingBirthday(false);
      }

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
              <AvatarImage src={photoURL || undefined} alt={displayName || "Usuario"} className="scale-150" />
              <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
            </Avatar>
            <div className="w-full space-y-2">
                <Label>Elige un avatar</Label>
                <div className="grid grid-cols-4 gap-2">
                    {AvatarPlaceholders.map(p => (
                        <button key={p.id} onClick={() => setPhotoURL(p.imageUrl)} className="rounded-full overflow-hidden border-2 transition-all border-transparent hover:border-primary/50 data-[active=true]:border-primary" data-active={photoURL === p.imageUrl}>
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
                {isEditingBirthday ? (
                    <Input
                    id="birthday"
                    placeholder="DD/MM/AAAA"
                    value={birthdayInput}
                    onChange={handleBirthdayChange}
                    maxLength={10}
                    />
                ) : (
                    <div className="flex items-center justify-between">
                        <p className="text-sm h-10 flex items-center">{birthdayInput}</p>
                        <Button variant="ghost" size="icon" onClick={() => setIsEditingBirthday(true)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </div>
                )}
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
