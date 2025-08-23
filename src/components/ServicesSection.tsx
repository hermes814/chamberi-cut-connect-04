import { Card, CardContent } from "@/components/ui/card";
import { Scissors, UserCheck, Sparkles, Users } from "lucide-react";

const services = [
  {
    icon: Scissors,
    title: "Corte de Cabello",
    description: "Cortes clásicos y modernos adaptados a tu estilo personal"
  },
  {
    icon: UserCheck,
    title: "Delineado de Barba",
    description: "Perfilado y arreglo profesional de barba con técnicas precisas"
  },
  {
    icon: Sparkles,
    title: "Cortes Clásicos y Modernos",
    description: "Desde estilos tradicionales hasta las últimas tendencias"
  },
  {
    icon: Users,
    title: "Asesoramiento de Imagen",
    description: "Consultoría personalizada para encontrar tu look perfecto"
  }
];

const ServicesSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-primary">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Nuestros Servicios
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Experiencia profesional con más de 10 años cuidando tu imagen
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300 hover:scale-105">
              <CardContent className="p-8 text-center">
                <service.icon className="h-16 w-16 text-electric-blue mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-white mb-4">
                  {service.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;