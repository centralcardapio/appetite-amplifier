import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const MakeAdminButton = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const makeAdmin = async () => {
    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    setLoading(true);
    try {
      // Insert admin role for current user
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'admin'
        });

      if (error) {
        console.error('Error creating admin role:', error);
        toast.error("Erro ao criar permissão de admin");
      } else {
        toast.success("Você agora é administrador! Recarregue a página.");
      }
    } catch (error) {
      console.error('Error in makeAdmin:', error);
      toast.error("Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader className="text-center">
        <Shield className="h-12 w-12 mx-auto mb-2 text-primary" />
        <CardTitle>Tornar-se Administrador</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Como ainda não há administradores no sistema, você pode se tornar o primeiro admin.
        </p>
        <Button 
          onClick={makeAdmin} 
          disabled={loading}
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Tornar-se Admin
        </Button>
      </CardContent>
    </Card>
  );
};