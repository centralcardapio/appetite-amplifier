import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Search, Eye, User } from "lucide-react";
import { toast } from "sonner";

interface UserPhoto {
  id: string;
  original_image_url: string;
  transformed_images: any;
  original_image_name: string;
  created_at: string;
}

export const UserPhotoViewer = () => {
  const [searchEmail, setSearchEmail] = useState("");
  const [userPhotos, setUserPhotos] = useState<UserPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userEmails, setUserEmails] = useState<string[]>([]);

  useEffect(() => {
    // Load user emails for autocomplete
    loadUserEmails();
  }, []);

  const loadUserEmails = async () => {
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;
      
      const emails = data.users
        .map((user: any) => user.email)
        .filter((email: string) => email)
        .sort();
        
      setUserEmails(emails);
    } catch (error) {
      console.error('Error loading user emails:', error);
    }
  };

  const searchUserPhotos = async () => {
    if (!searchEmail.trim()) {
      toast.error("Selecione um e-mail para buscar");
      return;
    }

    setIsLoading(true);
    try {
      // Find user ID by email
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;
      
      const user = authData.users.find((u: any) => u.email === searchEmail);
      if (!user) {
        toast.error("Usuário não encontrado");
        setIsLoading(false);
        return;
      }
      
      // Get user's photo transformations
      const { data: photos, error: photosError } = await supabase
        .from('photo_transformations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (photosError) throw photosError;

      setUserPhotos(photos || []);
      
      if (photos?.length === 0) {
        toast.info("Este usuário não possui fotos transformadas");
      }
    } catch (error) {
      console.error('Error searching user photos:', error);
      toast.error("Erro ao buscar fotos do usuário");
    } finally {
      setIsLoading(false);
    }
  };

  const getFinalTransformedImage = (transformedImages: any) => {
    if (!transformedImages) return null;
    
    // Handle if it's already an array
    if (Array.isArray(transformedImages)) {
      if (transformedImages.length === 0) return null;
      return transformedImages[transformedImages.length - 1];
    }
    
    // Handle if it's a JSON object
    try {
      const parsed = typeof transformedImages === 'string' ? JSON.parse(transformedImages) : transformedImages;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[parsed.length - 1];
      }
    } catch (e) {
      console.error('Error parsing transformed images:', e);
    }
    
    return null;
  };

  const openImageDialog = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="h-5 w-5" />
          Visualizar Fotos por Usuário
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <select
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="w-full h-10 px-3 py-2 text-sm bg-transparent border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              <option value="">Selecione um usuário...</option>
              {userEmails.map(email => (
                <option key={email} value={email}>{email}</option>
              ))}
            </select>
          </div>
          <Button onClick={searchUserPhotos} disabled={isLoading}>
            <Search className="h-4 w-4 mr-2" />
            {isLoading ? "Buscando..." : "Buscar"}
          </Button>
        </div>

        {userPhotos.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">
              {userPhotos.length} foto(s) encontrada(s) para {searchEmail}
            </h4>
            
            <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
              {userPhotos.map((photo) => {
                const finalImage = getFinalTransformedImage(photo.transformed_images);
                
                return (
                  <div key={photo.id} className="border rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-2">
                      {photo.original_image_name} • {new Date(photo.created_at).toLocaleDateString('pt-BR')}
                    </div>
                    
                    <div className="flex gap-3">
                      {/* Original Image */}
                      <div className="flex-1">
                        <div className="text-xs font-medium mb-1">Original</div>
                        <div 
                          className="relative aspect-square bg-muted rounded cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => openImageDialog(photo.original_image_url)}
                        >
                          <img
                            src={photo.original_image_url}
                            alt="Original"
                            className="w-full h-full object-cover rounded"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 rounded transition-opacity">
                            <Eye className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Transformed Image */}
                      <div className="flex-1">
                        <div className="text-xs font-medium mb-1">Transformada</div>
                        {finalImage ? (
                          <div 
                            className="relative aspect-square bg-muted rounded cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => openImageDialog(finalImage.url || finalImage)}
                          >
                            <img
                              src={typeof finalImage === 'string' ? finalImage : finalImage.url}
                              alt="Transformada"
                              className="w-full h-full object-cover rounded"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 rounded transition-opacity">
                              <Eye className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-square bg-muted rounded flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">Sem imagem</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Visualizar Imagem</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center">
              <img
                src={selectedImage}
                alt="Imagem ampliada"
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};