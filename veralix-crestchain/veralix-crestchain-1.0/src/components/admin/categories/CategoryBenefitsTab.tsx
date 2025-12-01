import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CLIENT_CATEGORY_LABELS, CLIENT_CATEGORY_DESCRIPTIONS } from '@/hooks/useClientCategories';
import { Check, Crown, Star, Award, Sparkles } from 'lucide-react';

export function CategoryBenefitsTab() {
  const categories = [
    {
      level: 'regular',
      icon: Sparkles,
      color: 'bg-muted text-muted-foreground',
      discount: '0%',
      benefits: [
        'Precio estándar en certificaciones individuales',
        'Precio base en paquetes de certificados',
        'Acceso al marketplace',
        'Soporte por email',
        'Dashboard básico'
      ]
    },
    {
      level: 'premium',
      icon: Star,
      color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      discount: '10%',
      benefits: [
        '10% de descuento en certificaciones individuales',
        'Descuentos especiales en paquetes',
        'Prioridad en el marketplace',
        'Soporte prioritario',
        'Dashboard con analytics básico',
        'Insignia de cuenta Premium'
      ]
    },
    {
      level: 'corporativo',
      icon: Award,
      color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      discount: '20%',
      benefits: [
        '20% de descuento en certificaciones individuales',
        'Descuentos corporativos en paquetes',
        'Destacado en marketplace',
        'Account manager dedicado',
        'Dashboard corporativo avanzado',
        'API access incluido',
        'Facturación mensual',
        'Insignia de cuenta Corporativa'
      ]
    },
    {
      level: 'mayorista',
      icon: Crown,
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      discount: '30%',
      benefits: [
        '30% de descuento en certificaciones individuales',
        'Máximo descuento en paquetes',
        'Posicionamiento premium en marketplace',
        'Soporte 24/7 dedicado',
        'Dashboard mayorista completo',
        'API completo y webhooks',
        'Términos de pago especiales',
        'White-label disponible',
        'Personalización de marca',
        'Insignia de cuenta Mayorista'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Beneficios por Categoría de Cliente</CardTitle>
          <CardDescription>
            Cada nivel de categoría ofrece beneficios únicos y descuentos progresivos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.level} className="border-2">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${category.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">
                            {CLIENT_CATEGORY_LABELS[category.level]}
                          </CardTitle>
                          <CardDescription>
                            {CLIENT_CATEGORY_DESCRIPTIONS[category.level]}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={category.color} variant="outline">
                        {category.discount}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cómo Funciona la Asignación de Categorías</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div>
            <h4 className="font-medium text-foreground mb-2">Asignación Manual</h4>
            <p>
              Los administradores pueden asignar categorías específicas a clientes según:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Volumen de compras históricas</li>
              <li>Tipo de negocio y necesidades</li>
              <li>Acuerdos comerciales específicos</li>
              <li>Potencial de crecimiento</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-2">Aplicación Automática</h4>
            <p>
              Los descuentos y beneficios se aplican automáticamente cuando:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>El cliente compra una certificación individual</li>
              <li>El cliente selecciona un paquete de certificados</li>
              <li>El cliente accede a funcionalidades premium</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-2">Beneficios Visuales</h4>
            <p>
              Los clientes con categorías especiales ven:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Badge de su categoría en su perfil</li>
              <li>Precios personalizados destacados</li>
              <li>Descuentos aplicados automáticamente</li>
              <li>Acceso a funcionalidades exclusivas</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}