import { MapPin, Phone } from "lucide-react";
import heroImage from "@/assets/barbershop-hero.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black/70" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
          CHAMBERI
          <span className="block text-electric-blue">BARBER SHOP</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Estilo, tradición y modernidad en el corazón de Chamberí
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <div className="flex items-center gap-2 text-gray-300">
            <MapPin className="h-5 w-5 text-electric-blue" />
            <span>C/ de Donoso Cortés, 90, Chamberí</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Phone className="h-5 w-5 text-electric-blue" />
            <span>+34 912 373 521</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;