import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Package, DollarSign, Users } from "lucide-react";

interface SalesData {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
}

const Reports = () => {
  const { totalItems } = useCart();
  const [salesData, setSalesData] = useState<SalesData>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    const { data: orders } = await supabase
      .from("orders")
      .select("*, profiles(name, email)")
      .order("created_at", { ascending: false })
      .limit(10);

    const { data: products } = await supabase
      .from("products")
      .select("id")
      .eq("active", true);

    const { data: customers } = await supabase
      .from("profiles")
      .select("id");

    if (orders) {
      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);
      setSalesData({
        totalOrders: orders.length,
        totalRevenue,
        totalProducts: products?.length || 0,
        totalCustomers: customers?.length || 0,
      });
      setRecentOrders(orders);
    }
  };

  const stats = [
    {
      title: "Pedidos Totais",
      value: salesData.totalOrders,
      icon: Package,
      color: "text-blue-500",
    },
    {
      title: "Receita Total",
      value: `R$ ${salesData.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "Produtos Ativos",
      value: salesData.totalProducts,
      icon: TrendingUp,
      color: "text-purple-500",
    },
    {
      title: "Clientes",
      value: salesData.totalCustomers,
      icon: Users,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar cartItemsCount={totalItems} />
      
      <main className="container py-8">
        <h1 className="text-4xl font-bold mb-8 bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
          Relatórios de Vendas
        </h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-10 w-10 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.profiles?.name || order.profiles?.email}
                    </p>
                    <p className="text-sm text-muted-foreground">{order.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">R$ {parseFloat(order.total).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground capitalize">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Reports;
