import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AppRole = "cliente" | "entregador" | "gerente" | "administrador";

interface UserWithRoles {
  id: string;
  email: string;
  name: string | null;
  roles: AppRole[];
}

const AdminUsers = () => {
  const { totalItems } = useCart();
  const [users, setUsers] = useState<UserWithRoles[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, name");

    if (profiles) {
      const usersWithRoles = await Promise.all(
        profiles.map(async (profile) => {
          const { data: userRoles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", profile.id);

          return {
            ...profile,
            roles: userRoles?.map((r) => r.role as AppRole) || [],
          };
        })
      );

      setUsers(usersWithRoles);
    }
  };

  const addRole = async (userId: string, role: AppRole) => {
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role });

    if (error) {
      toast.error("Erro ao adicionar permissão");
      return;
    }

    toast.success("Permissão adicionada!");
    fetchUsers();
  };

  const removeRole = async (userId: string, role: AppRole) => {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", role);

    if (error) {
      toast.error("Erro ao remover permissão");
      return;
    }

    toast.success("Permissão removida!");
    fetchUsers();
  };

  const roleColors: Record<AppRole, string> = {
    cliente: "secondary",
    entregador: "default",
    gerente: "default",
    administrador: "secondary",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar cartItemsCount={totalItems} />
      
      <main className="container py-8">
        <h1 className="text-4xl font-bold mb-8 bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
          Gerenciar Usuários e Permissões
        </h1>

        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <p className="text-xl">{user.name || "Sem nome"}</p>
                    <p className="text-sm text-muted-foreground font-normal">{user.email}</p>
                  </div>
                  <Select
                    onValueChange={(value) => addRole(user.id, value as AppRole)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Adicionar permissão" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cliente">Cliente</SelectItem>
                      <SelectItem value="entregador">Entregador</SelectItem>
                      <SelectItem value="gerente">Gerente</SelectItem>
                      <SelectItem value="administrador">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user.roles.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhuma permissão atribuída</p>
                  )}
                  {user.roles.map((role) => (
                    <Badge
                      key={role}
                      variant={roleColors[role] as any}
                      className="flex items-center gap-2"
                    >
                      {role}
                      <button
                        onClick={() => removeRole(user.id, role)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminUsers;
