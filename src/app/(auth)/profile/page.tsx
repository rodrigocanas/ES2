"use client"; // Adicionado "use client" se houver interatividade futura, embora não seja estritamente necessário para este layout estático

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { User, Settings, Activity, Lock, Edit3 } from "lucide-react";

// Assumindo que esta página será renderizada dentro do teu RootLayout que já tem Navbar e Footer
export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);

  // Campos editáveis
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      setFullName(session.user.name || "");
      setBio(session.user.bio || "");
      setLocation(session.user.location || "");
    }
  }, [session]);

  if (status === "loading") {
    return <div className="text-center mt-10">A carregar perfil...</div>;
  }

  const userProfile = useMemo(
    () => ({
      email: session?.user?.email,
      avatarSrc: "https://github.com/shadcn.png",
      avatarFallback: session?.user?.name?.[0]?.toUpperCase() || "U",
      activityLog: [
        { date: "Há 1 dia", action: "Iniciou sessão com sucesso." },
        { date: "Há 3 dias", action: "Atualizou o perfil." },
        { date: "Há 1 semana", action: "Juntou-se à comunidade." },
      ],
    }),
    [session]
  );

  const handleSave = async () => {
    try {
      const res = await fetch("/api/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, bio, location }),
      });

      if (res.ok) {
        alert("Perfil atualizado com sucesso!");
        setIsEditing(false);
      } else {
        alert("Erro ao atualizar perfil.");
      }
    } catch (error) {
      alert("Erro na comunicação com o servidor.");
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto my-10 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-4xl mx-auto shadow-lg rounded-xl border border-border/60">
        <CardHeader className="p-6 sm:p-8 bg-card rounded-t-xl">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border-4 border-primary/80 shadow-md">
              <AvatarImage src={userProfile.avatarSrc} alt="Foto de Perfil do Utilizador" />
              <AvatarFallback className="text-3xl font-semibold">{userProfile.avatarFallback}</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left flex-grow">
              <CardTitle className="text-3xl xl:text-4xl font-bold text-foreground">{fullName}</CardTitle>
              <CardDescription className="text-md text-muted-foreground mt-1">{bio}</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 sm:mt-0 sm:ml-auto whitespace-nowrap"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="mr-2 h-4 w-4" /> {isEditing ? "Cancelar" : "Editar Perfil"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 sm:p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-1 h-auto sm:h-11 bg-muted p-1 rounded-lg mb-6">
              <TabsTrigger
                value="overview"
                className="flex items-center justify-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <User className="h-4 w-4" />
                <span>Visão Geral</span>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="flex items-center justify-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <Settings className="h-4 w-4" />
                <span>Definições</span>
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="flex items-center justify-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <Activity className="h-4 w-4" />
                <span>Atividade</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-0">
              <Card className="border-none shadow-none">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Informações Pessoais</CardTitle>
                  <CardDescription>Detalhes públicos do teu perfil.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-1">
                      <Label htmlFor="fullName">Nome Completo</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        readOnly={!isEditing}
                        className={!isEditing ? "read-only:cursor-default read-only:bg-muted/50" : ""}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="email">Endereço de Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userProfile.email}
                        readOnly
                        className="read-only:cursor-default read-only:bg-muted/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="bio">Biografia Curta</Label>
                    <Input
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      readOnly={!isEditing}
                      className={!isEditing ? "read-only:cursor-default read-only:bg-muted/50" : ""}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="location">Localização</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      readOnly={!isEditing}
                      className={!isEditing ? "read-only:cursor-default read-only:bg-muted/50" : ""}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <Card className="border-none shadow-none">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Definições da Conta</CardTitle>
                  <CardDescription>Gere as tuas preferências e informações de segurança.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Aqui podes adicionar mais campos editáveis conforme precisares */}
                  <div className="space-y-2">
                    <Label htmlFor="username">Nome de Utilizador</Label>
                    <Input id="username" defaultValue={userProfile.avatarFallback} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-settings">Email para Notificações</Label>
                    <Input id="email-settings" type="email" defaultValue={userProfile.email} readOnly />
                  </div>
                  <Card className="p-4 sm:p-6 border bg-card">
                    <CardHeader className="p-0 mb-4">
                      <CardTitle className="text-lg flex items-center font-medium">
                        <Lock className="mr-2 h-5 w-5 text-primary" />
                        Alterar Palavra-passe
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-4">
                      <div className="space-y-1">
                        <Label htmlFor="current-password">Palavra-passe Atual</Label>
                        <Input id="current-password" type="password" placeholder="********" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="new-password">Nova Palavra-passe</Label>
                        <Input id="new-password" type="password" placeholder="********" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="confirm-password">Confirmar Nova Palavra-passe</Label>
                        <Input id="confirm-password" type="password" placeholder="********" />
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
                {/* Sem botão guardar aqui */}
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-0">
              <Card className="border-none shadow-none">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Atividade Recente</CardTitle>
                  <CardDescription>Histórico das tuas interações e conquistas.</CardDescription>
                </CardHeader>
                <CardContent>
                  {userProfile.activityLog.length > 0 ? (
                    <ul className="space-y-4">
                      {userProfile.activityLog.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-start space-x-3 pb-3 border-b border-border/60 border-dashed last:border-b-0"
                        >
                          <Activity className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{item.action}</p>
                            <p className="text-xs text-muted-foreground">{item.date}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">Ainda não há atividade para mostrar.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>

        {isEditing && (
          <CardFooter className="border-t px-6 py-4 flex justify-end">
            <Button variant="default" onClick={handleSave}>
              Guardar Alterações
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
