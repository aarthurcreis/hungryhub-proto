import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CreditCard, Wallet, DollarSign } from "lucide-react";

const Checkout = () => {
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [address, setAddress] = useState("");

  const handleFinishOrder = () => {
    if (!address) {
      toast.error("Por favor, preencha o endereço de entrega");
      return;
    }

    const orderId = `#${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    clearCart();
    toast.success("Pedido realizado com sucesso!");
    navigate(`/order-tracking?id=${orderId}`);
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar cartItemsCount={totalItems} />
      
      <main className="container py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
          Finalizar Pedido
        </h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Endereço de Entrega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Endereço completo</Label>
                <Input
                  id="address"
                  placeholder="Rua, número, complemento, bairro, cidade"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Forma de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="credit-card" id="credit-card" />
                  <Label htmlFor="credit-card" className="flex items-center gap-2 cursor-pointer flex-1">
                    <CreditCard className="h-5 w-5" />
                    Cartão de Crédito
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="debit-card" id="debit-card" />
                  <Label htmlFor="debit-card" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Wallet className="h-5 w-5" />
                    Cartão de Débito
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                    <DollarSign className="h-5 w-5" />
                    Dinheiro
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>R$ {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxa de entrega</span>
                  <span>R$ 5.00</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">R$ {(totalPrice + 5).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            variant="gradient" 
            className="w-full" 
            size="lg"
            onClick={handleFinishOrder}
          >
            Confirmar Pedido
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
