import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, Clock, Truck, Package } from "lucide-react";

const ORDER_STATUSES = [
  { id: "confirmed", label: "Pedido Confirmado", icon: CheckCircle2 },
  { id: "preparing", label: "Em Preparação", icon: Package },
  { id: "delivering", label: "Saiu para Entrega", icon: Truck },
  { id: "delivered", label: "Entregue", icon: CheckCircle2 },
];

const OrderTracking = () => {
  const { totalItems } = useCart();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("id") || "#000000";
  const [currentStatus, setCurrentStatus] = useState(0);

  useEffect(() => {
    // Simula progresso do pedido
    const interval = setInterval(() => {
      setCurrentStatus((prev) => {
        if (prev < ORDER_STATUSES.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar cartItemsCount={totalItems} />
      
      <main className="container py-8 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
            Acompanhe seu Pedido
          </h1>
          <p className="text-muted-foreground">Pedido {orderId}</p>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="space-y-8">
              {ORDER_STATUSES.map((status, index) => {
                const Icon = status.icon;
                const isCompleted = index <= currentStatus;
                const isCurrent = index === currentStatus;

                return (
                  <div key={status.id} className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all ${
                        isCompleted
                          ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                          : "bg-muted text-muted-foreground"
                      } ${isCurrent ? "scale-110" : ""}`}
                    >
                      {isCurrent && !isCompleted ? (
                        <Clock className="h-6 w-6 animate-pulse" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>
                    <div className="flex-1 pt-2">
                      <h3
                        className={`font-semibold text-lg ${
                          isCompleted ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {status.label}
                      </h3>
                      {isCurrent && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Em andamento...
                        </p>
                      )}
                      {isCompleted && index < currentStatus && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Concluído
                        </p>
                      )}
                    </div>
                    {index < ORDER_STATUSES.length - 1 && (
                      <div
                        className={`absolute left-10 mt-16 h-8 w-0.5 ${
                          isCompleted ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {currentStatus === ORDER_STATUSES.length - 1 && (
              <div className="mt-8 p-4 bg-secondary rounded-lg text-center">
                <p className="text-lg font-semibold">
                  Pedido entregue com sucesso! 🎉
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Esperamos que você aproveite sua refeição!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default OrderTracking;
