import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { ProductCard, Product } from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import burgerImg from "@/assets/burger.jpg";
import pizzaImg from "@/assets/pizza.jpg";
import pastaImg from "@/assets/pasta.jpg";
import salmonImg from "@/assets/salmon.jpg";

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Burger Clássico",
    description: "Hambúrguer suculento com queijo, alface, tomate e molho especial",
    price: 29.90,
    image: burgerImg,
  },
  {
    id: "2",
    name: "Pizza Margherita",
    description: "Pizza tradicional com mussarela, tomate fresco e manjericão",
    price: 45.00,
    image: pizzaImg,
  },
  {
    id: "3",
    name: "Pasta Carbonara",
    description: "Massa fresca com molho carbonara cremoso e bacon crocante",
    price: 38.50,
    image: pastaImg,
  },
  {
    id: "4",
    name: "Salmão Grelhado",
    description: "Salmão grelhado com legumes frescos e molho de limão",
    price: 52.00,
    image: salmonImg,
  },
  {
    id: "5",
    name: "Burger Duplo",
    description: "Dois hambúrgueres com queijo cheddar, bacon e cebola caramelizada",
    price: 39.90,
    image: burgerImg,
  },
  {
    id: "6",
    name: "Pizza Quatro Queijos",
    description: "Combinação perfeita de mussarela, gorgonzola, parmesão e provolone",
    price: 48.00,
    image: pizzaImg,
  },
];

const Menu = () => {
  const { addToCart, totalItems } = useCart();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = MOCK_PRODUCTS.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar cartItemsCount={totalItems} />
      
      <main className="container py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
            Nosso Cardápio
          </h1>
          <p className="text-muted-foreground">
            Escolha seus pratos favoritos e faça seu pedido
          </p>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md mx-auto block px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Menu;
