-- Criar enum para roles
CREATE TYPE public.app_role AS ENUM ('cliente', 'entregador', 'gerente', 'administrador');

-- Criar tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Criar tabela de roles de usuários
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função para verificar role (CRIAR ANTES DE USAR NAS POLÍTICAS!)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Políticas para user_roles (agora a função já existe)
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'administrador'));

-- Trigger para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Tabela de produtos
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Políticas para products
CREATE POLICY "Everyone can view active products"
  ON public.products FOR SELECT
  USING (active = TRUE);

CREATE POLICY "Managers can manage products"
  ON public.products FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'gerente') OR public.has_role(auth.uid(), 'administrador'));

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Tabela de pedidos
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.profiles(id),
  delivery_person_id UUID REFERENCES public.profiles(id),
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'preparing', 'delivering', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Políticas para orders
CREATE POLICY "Customers can view their own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

CREATE POLICY "Delivery persons can view available and assigned orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'entregador') AND
    (delivery_person_id IS NULL OR delivery_person_id = auth.uid())
  );

CREATE POLICY "Delivery persons can update their orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'entregador') AND
    delivery_person_id = auth.uid()
  );

CREATE POLICY "Managers and admins can view all orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'gerente') OR
    public.has_role(auth.uid(), 'administrador')
  );

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Tabela de itens do pedido
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Políticas para order_items
CREATE POLICY "Users can view items from their viewable orders"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.customer_id = auth.uid() OR
        orders.delivery_person_id = auth.uid() OR
        public.has_role(auth.uid(), 'gerente') OR
        public.has_role(auth.uid(), 'administrador')
      )
    )
  );