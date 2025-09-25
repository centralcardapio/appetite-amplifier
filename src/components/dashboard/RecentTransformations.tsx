import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Image, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RecentTransformationsProps {
  transformations: Array<{
    id: string;
    original_image_name: string;
    status: string;
    created_at: string;
    transformed_images: any[];
    reprocessing_count: number;
    user_email?: string;
  }>;
}

export const RecentTransformations = ({ transformations }: RecentTransformationsProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Concluída</Badge>;
      case 'processing':
        return <Badge variant="secondary">Processando</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const truncateFileName = (fileName: string, maxLength: number = 30) => {
    if (fileName.length <= maxLength) return fileName;
    return fileName.substring(0, maxLength - 3) + '...';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <Image className="h-5 w-5 text-primary" />
          Transformações Recentes
        </CardTitle>
        <Badge variant="outline">
          {transformations.length} itens
        </Badge>
      </CardHeader>
      <CardContent>
        {transformations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma transformação encontrada
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Processamentos</TableHead>
                  <TableHead>Criado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transformations.map((transformation) => (
                  <TableRow key={transformation.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {truncateFileName(transformation.original_image_name)}
                        </span>
                        {transformation.reprocessing_count > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {transformation.reprocessing_count} reprocessamentos
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {transformation.user_email || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {transformation.transformed_images?.length || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(transformation.created_at), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};