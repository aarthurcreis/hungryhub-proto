import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface User {
  email: string;
  password: string;
  name: string;
  role: 'cliente' | 'entregador' | 'gerente' | 'administrador';
}

const testUsers: User[] = [
  { email: 'cliente@gmail.com', password: '123456', name: 'Cliente Teste', role: 'cliente' },
  { email: 'entregador@gmail.com', password: '123456', name: 'Entregador Teste', role: 'entregador' },
  { email: 'gerente@gmail.com', password: '123456', name: 'Gerente Teste', role: 'gerente' },
  { email: 'administrador@gmail.com', password: '123456', name: 'Administrador Teste', role: 'administrador' },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const results = [];

    for (const user of testUsers) {
      // Criar usuário
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { name: user.name }
      });

      if (authError) {
        console.error(`Erro ao criar ${user.email}:`, authError);
        results.push({ email: user.email, status: 'error', message: authError.message });
        continue;
      }

      // Atribuir role
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: user.role
        });

      if (roleError) {
        console.error(`Erro ao atribuir role a ${user.email}:`, roleError);
        results.push({ email: user.email, status: 'partial', message: 'Usuário criado mas erro ao atribuir role' });
      } else {
        results.push({ email: user.email, status: 'success', role: user.role });
      }
    }

    return new Response(
      JSON.stringify({ message: 'Setup completo', results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro no setup:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
