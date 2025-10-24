import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ProductForm {
  id?: string;
  name: string;
  description: string;
  price: string;
  image_url?: string;
}

const ManagerProducts = () => {
  const { totalItems } = useCart();
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<ProductForm>({
    name: "",
    description: "",
    price: "",
    image_url: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("active", true);

    if (data) {
      setProducts(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.price) {
      toast.error("Preencha todos os campos!");
      return;
    }

    if (!user) return;

    if (formData.id) {
      const { error } = await supabase
        .from("products")
        .update({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          image_url: formData.image_url,
        })
        .eq("id", formData.id);

      if (error) {
        toast.error("Erro ao atualizar produto");
        return;
      }
      toast.success("Produto atualizado!");
    } else {
      const { error } = await supabase
        .from("products")
        .insert({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          image_url: formData.image_url,
          created_by: user.id,
        });

      if (error) {
        toast.error("Erro ao cadastrar produto");
        return;
      }
      toast.success("Produto cadastrado!");
    }

    setFormData({ name: "", description: "", price: "", image_url: "" });
    setIsFormOpen(false);
    fetchProducts();
  };

  const handleEdit = (product: any) => {
    setFormData({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image_url: product.image_url,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("products")
      .update({ active: false })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao remover produto");
      return;
    }

    toast.success("Produto removido!");
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar cartItemsCount={totalItems} />
      
      <main className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
            Gerenciar Produtos
          </h1>
          <Button variant="gradient" onClick={() => {
            setFormData({ name: "", description: "", price: "", image_url: "" });
            setIsFormOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>

        {isFormOpen && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{formData.id ? "Editar Produto" : "Cadastrar Produto"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Produto</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Burger Clássico"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva o produto..."
                  />
                </div>
                <div>
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" variant="default">
                    Salvar Produto
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-4">
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                <p className="text-xl font-bold text-primary mb-4">R$ {parseFloat(product.price).toFixed(2)}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ManagerProducts;
