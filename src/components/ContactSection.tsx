import { MapPin, Phone, Clock, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import qrCode from "@/assets/chamberi-qr-code.png";

const ContactSection = () => {
  const handleWhatsAppClick = () => {
    const phoneNumber = "+34648492221";
    const message = encodeURIComponent("Hola! Me gustaría reservar una cita en Chamberi Barber Shop");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  const handleInstagramClick = () => {
    window.open("https://www.instagram.com/chamberibarbershop_/", "_blank");
  };

  return (
    <section className="py-20 px-4 bg-gradient-card">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Visítanos
          </h2>
          <p className="text-xl text-gray-300">
            Te esperamos en el corazón de Chamberí
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Card className="bg-background border-border shadow-card h-full">
              <CardContent className="p-0 h-full">
                <div className="h-96 lg:h-full min-h-[400px] rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3036.4849!2d-3.7122!3d40.4378!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd42287c8b3b3b3b%3A0x1234567890abcdef!2sC.%20de%20Donoso%20Cort%C3%A9s%2C%2090%2C%20Chamber%C3%AD%2C%2028015%20Madrid!5e0!3m2!1ses!2ses!4v1234567890123!5m2!1ses!2ses&q=C.+de+Donoso+Cortés,+90,+Chamberí,+28015+Madrid"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-lg"
                    title="Ubicación de Chamberi Barber Shop"
                  ></iframe>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="bg-background border-border shadow-card">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <MapPin className="h-6 w-6 text-electric-blue mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Dirección</h3>
                    <p className="text-gray-300 leading-relaxed">
                      C/ de Donoso Cortés, 90<br />
                      28015 Chamberí, Madrid
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 mb-6">
                  <Phone className="h-6 w-6 text-electric-blue mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Teléfono</h3>
                    <p className="text-gray-300">+34 648 492 221</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Clock className="h-6 w-6 text-electric-blue mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Horarios</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Lunes a Viernes: 9:00 - 20:00<br />
                      Sábados: 9:00 - 19:00<br />
                      Domingos: 11:00 - 20:00
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-background border-border shadow-card">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-semibold text-white mb-4">
                  Reserva tu Cita
                </h3>
                <p className="text-gray-300 mb-6">
                  Contacta con nosotros por WhatsApp para una atención inmediata
                </p>
                <Button 
                  onClick={handleWhatsAppClick}
                  className="w-full bg-gradient-accent hover:bg-electric-blue-dark text-white font-semibold shadow-glow hover:shadow-lg hover:scale-105 transition-all duration-300"
                  size="lg"
                >
                  Reservar por WhatsApp
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-background border-border shadow-card">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-semibold text-white mb-4">
                  Síguenos
                </h3>
                <p className="text-gray-300 mb-6">
                  Mantente al día con nuestros trabajos y novedades
                </p>
                <Button 
                  onClick={handleInstagramClick}
                  variant="outline"
                  className="w-full border-electric-blue text-electric-blue hover:bg-electric-blue hover:text-white transition-all duration-300"
                  size="lg"
                >
                  <Instagram className="h-5 w-5 mr-2" />
                  @chamberibarbershop_
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-background border-border shadow-card">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-semibold text-white mb-4">
                  Encuéntranos en Google
                </h3>
                <p className="text-gray-300 mb-6">
                  Escanea el código QR para ver nuestras reseñas
                </p>
                <a 
                  href="https://www.google.com/search?q=chamberi+barbershop&sca_esv=825d6cf8198b9510&sxsrf=AE3TifOIMqzdlcHiHNQvVmlUEP2rkyGY_Q%3A1760955780120&source=hp&ei=hA32aPatBbqhkdUPpY2_mA4&iflsig=AOw8s4IAAAAAaPYblJHY5c00qIp-Q5tHHpECp01VJH1p&oq=chamberi+barber&gs_lp=Egdnd3Mtd2l6GgIYAyIPY2hhbWJlcmkgYmFyYmVyKgIIADIFEAAYgAQyBhAAGBYYHjIGEAAYFhgeMgkQABgWGIsDGB4yCRAAGBYYiwMYHjILEAAYFhgKGIsDGB4yCRAAGBYYiwMYHjIJEAAYFhiLAxgeMgkQABgWGIsDGB4yCRAAGBYYiwMYHki9MlAAWMomcAB4AJABAJgBiwGgAdQLqgEEMTAuNbgBA8gBAPgBAZgCD6ACkAzCAgQQIxgnwgIIEAAYgAQYsQPCAhEQLhiABBixAxjRAxiDARjHAcICCxAAGIAEGLEDGIMBwgILEC4YgAQYsQMYgwHCAg4QABiABBixAxiDARiKBcICCBAuGIAEGLEDwgIOEAAYgAQYsQMYgwEYyQPCAgsQABiABBiSAxiKBcICDhAuGIAEGKgDGIsDGJ0DwgIIEAAYgAQYiwPCAg4QLhiABBjHARiOBRivAcICBRAuGIAEwgIREC4YgAQYsQMYxwEYjgUYrwHCAhcQLhiABBixAxjRAxjSAxjHARioAxiLA8ICFxAuGIAEGKYDGMcBGKgDGIsDGI4FGK8BwgIREC4YgAQYsQMYqAMYmgMYiwPCAgsQABiABBixAxiLA8ICFBAuGIAEGLEDGKIFGKgDGIsDGJ0DwgIaEC4YgAQYpgMYxwEY-AUYqAMYiwMYjgUYrwGYAwCSBwM3LjigB9LKAbIHAzcuOLgHkAzCBwYwLjEzLjLIByo&sclient=gws-wiz#vhid=/g/11wtymk31y&vssid=lcl&irp="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img 
                    src={qrCode} 
                    alt="Código QR para Google Reviews de Chamberi Barber Shop" 
                    className="w-48 h-48 mx-auto rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
                  />
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;