import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchOrders();

    const subscription = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(quantity)")
      .or(`delivery_person_id.is.null,delivery_person_id.eq.${user?.id}`)
      .in("status", ["pending", "accepted", "delivering"])
      .order("created_at", { ascending: false });

    if (data) {
      setOrders(data.map(order => ({
        ...order,
        id: order.order_number,
        items: order.order_items.reduce((sum: number, item: any) => sum + item.quantity, 0),
      })));
    }
  };

  const handleAcceptOrder = async (order: any) => {
    if (!user) return;

    const { error } = await supabase
      .from("orders")
      .update({ status: "accepted", delivery_person_id: user.id })
      .eq("id", order.id);

    if (error) {
      toast.error("Erro ao aceitar pedido");
      return;
    }
    toast.success("Pedido aceito!");
    fetchOrders();
  };

  const handleStartDelivery = async (order: any) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "delivering" })
      .eq("id", order.id);

    if (error) {
      toast.error("Erro ao iniciar entrega");
      return;
    }
    toast.success("Entrega iniciada!");
    fetchOrders();
  };

  const handleCompleteDelivery = async (order: any) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "delivered" })
      .eq("id", order.id);

    if (error) {
      toast.error("Erro ao concluir entrega");
      return;
    }
    toast.success("Entrega concluída!");
    fetchOrders();
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
                        onClick={() => handleAcceptOrder(order)}
                      >
                        Aceitar Pedido
                      </Button>
                    )}
                    {order.status === "accepted" && (
                      <Button 
                        variant="default" 
                        onClick={() => handleStartDelivery(order)}
                      >
                        Iniciar Entrega
                      </Button>
                    )}
                    {order.status === "delivering" && (
                      <Button 
                        variant="default" 
                        onClick={() => handleCompleteDelivery(order)}
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
