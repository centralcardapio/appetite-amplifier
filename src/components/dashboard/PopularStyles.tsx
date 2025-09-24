import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, Palette } from "lucide-react";

interface PopularStylesProps {
  styles: Array<{
    style: string;
    count: number;
  }>;
}

export const PopularStyles = ({ styles }: PopularStylesProps) => {
  const maxCount = Math.max(...styles.map(s => s.count), 1);
  
  const styleDisplayNames: Record<string, string> = {
    'moderno-gourmet': 'Moderno Gourmet',
    'classico-italiano': 'Clássico Italiano',
    'contemporaneo-asiatico': 'Contemporâneo Asiático',
    'rustico-madeira': 'Rústico Madeira',
    'clean-minimalista': 'Clean Minimalista',
    'alta-gastronomia': 'Alta Gastronomia',
    'pub-moderno': 'Pub Moderno',
    'cafe-aconchegante': 'Café Aconchegante',
    'saudavel-vibrante': 'Saudável Vibrante'
  };

  const getStyleColor = (index: number) => {
    const colors = [
      'hsl(var(--primary))',
      'hsl(var(--accent))', 
      'hsl(262 83% 58%)',
      'hsl(142 76% 36%)',
      'hsl(217 91% 60%)'
    ];
    return colors[index % colors.length];
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          Estilos Mais Populares
        </CardTitle>
        <Badge variant="secondary">
          {styles.reduce((sum, s) => sum + s.count, 0)} total
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {styles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum estilo selecionado ainda
            </p>
          ) : (
            styles.map((style, index) => (
              <div key={style.style} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getStyleColor(index) }}
                    />
                    <span className="text-sm font-medium">
                      {styleDisplayNames[style.style] || style.style}
                    </span>
                    {index === 0 && (
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{style.count}</div>
                    <div className="text-xs text-muted-foreground">
                      {((style.count / styles.reduce((sum, s) => sum + s.count, 0)) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                <Progress 
                  value={(style.count / maxCount) * 100} 
                  className="h-2"
                  style={{
                    '--progress-background': getStyleColor(index)
                  } as React.CSSProperties}
                />
              </div>
            ))
          )}
        </div>

        {styles.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Estilo líder:</span>
              <span className="font-medium">
                {styleDisplayNames[styles[0]?.style] || styles[0]?.style}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};