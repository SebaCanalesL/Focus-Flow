"use client";

import { useState } from "react";
import { useAppData } from "@/contexts/app-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, sendPasswordResetEmail, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ProfilePage() {
  const { user, setUser, loading } = useAppData();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

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

      // We need to manually update the user object in our context
      const updatedUser = { ...user, displayName, photoURL } as User;
      setUser(updatedUser);

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
              <AvatarImage src={photoURL || `https://i.pravatar.cc/150?u=${user.uid}`} alt={displayName || "Usuario"} />
              <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
            </Avatar>
            <div className="w-full space-y-2">
                <Label htmlFor="photo-url">URL de la Foto</Label>
                <Input
                    id="photo-url"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    placeholder="https://ejemplo.com/foto.jpg"
                />
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo</Label>
                <Input id="email" value={user.email || ""} disabled />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Seguridad</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="font-medium">Cambiar Contraseña</p>
              <p className="text-sm text-muted-foreground">Te enviaremos un correo para que puedas cambiar tu contraseña.</p>
            </div>
            <Button variant="outline" onClick={handlePasswordReset}>Enviar Correo</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
