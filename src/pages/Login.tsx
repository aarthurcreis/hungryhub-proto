import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { UtensilsCrossed, User, Truck, BarChart } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roles = [
    {
      id: "customer",
      title: "Cliente",
      icon: User,
      description: "Fazer pedidos e acompanhar entregas",
      route: "/",
    },
    {
      id: "manager",
      title: "Gerente",
      icon: BarChart,
      description: "Gerenciar produtos e relatórios",
      route: "/manager/products",
    },
    {
      id: "delivery",
      title: "Entregador",
      icon: Truck,
      description: "Visualizar e realizar entregas",
      route: "/delivery",
    },
  ];

  const handleLogin = () => {
    if (!selectedRole) {
      toast.error("Selecione um perfil para continuar");
      return;
    }

    const role = roles.find(r => r.id === selectedRole);
    if (role) {
      toast.success(`Bem-vindo(a), ${role.title}!`);
      navigate(role.route);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[image:var(--gradient-primary)] mb-4">
            <UtensilsCrossed className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
            FoodExpress
          </h1>
          <p className="text-muted-foreground">Selecione seu perfil para continuar</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <Card
                key={role.id}
                className={`cursor-pointer transition-all hover:shadow-[var(--shadow-lg)] ${
                  isSelected ? "ring-2 ring-primary shadow-[var(--shadow-glow)]" : ""
                }`}
                onClick={() => setSelectedRole(role.id)}
              >
                <CardHeader>
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center mb-2 ${
                    isSelected ? "bg-[image:var(--gradient-primary)]" : "bg-secondary"
                  }`}>
                    <Icon className={`h-6 w-6 ${
                      isSelected ? "text-primary-foreground" : "text-foreground"
                    }`} />
                  </div>
                  <CardTitle>{role.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {role.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Button
          variant="gradient"
          size="lg"
          className="w-full"
          onClick={handleLogin}
        >
          Entrar
        </Button>
      </div>
    </div>
  );
};

export default Login;
