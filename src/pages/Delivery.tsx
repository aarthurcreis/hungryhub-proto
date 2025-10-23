import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { MapPin, Phone, Package } from "lucide-react";
import { toast } from "sonner";

interface DeliveryOrder {
  id: string;
  address: string;
  phone: string;
  items: number;
  total: number;
  status: "pending" | "accepted" | "delivering" | "delivered";
}

const Delivery = () => {
  const { totalItems } = useCart();
  const [orders, setOrders] = useState<DeliveryOrder[]>([
    {
      id: "#A1B2C3",
      address: "Rua das Flores, 123 - Centro",
      phone: "(11) 98765-4321",
      items: 3,
      total: 87.40,
      status: "pending",
    },
    {
      id: "#D4E5F6",
      address: "Av. Principal, 456 - Jardim",
      phone: "(11) 91234-5678",
      items: 2,
      total: 75.90,
      status: "pending",
    },
  ]);

  const handleAcceptOrder = (orderId: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: "accepted" as const } : order
    ));
    toast.success("Pedido aceito! Iniciando entrega...");
  };

  const handleStartDelivery = (orderId: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: "delivering" as const } : order
    ));
    toast.success("Entrega iniciada!");
  };

  const handleCompleteDelivery = (orderId: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: "delivered" as const } : order
    ));
    toast.success("Entrega concluída!");
  };

  const getStatusBadge = (status: DeliveryOrder["status"]) => {
    const statusConfig = {
      pending: { label: "Pendente", variant: "secondary" as const },
      accepted: { label: "Aceito", variant: "default" as const },
      delivering: { label: "Em Entrega", variant: "default" as const },
      delivered: { label: "Entregue", variant: "secondary" as const },
    };
    
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar cartItemsCount={totalItems} />
      
      <main className="container py-8">
        <h1 className="text-4xl font-bold mb-8 bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
          Entregas Disponíveis
        </h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold">Pedido {order.id}</h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {order.address}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {order.phone}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Package className="h-4 w-4" />
                        {order.items} itens - R$ {order.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {order.status === "pending" && (
                      <Button 
                        variant="gradient" 
                        onClick={() => handleAcceptOrder(order.id)}
                      >
                        Aceitar Pedido
                      </Button>
                    )}
                    {order.status === "accepted" && (
                      <Button 
                        variant="default" 
                        onClick={() => handleStartDelivery(order.id)}
                      >
                        Iniciar Entrega
                      </Button>
                    )}
                    {order.status === "delivering" && (
                      <Button 
                        variant="default" 
                        onClick={() => handleCompleteDelivery(order.id)}
                      >
                        Concluir Entrega
                      </Button>
                    )}
                    {order.status === "delivered" && (
                      <Badge variant="secondary" className="text-center">
                        Finalizado
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Delivery;
