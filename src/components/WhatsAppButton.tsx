import { Button } from "@/components/ui/button";
import whatsappLogo from "@/assets/whatsapp-logo.png";

const WhatsAppButton = () => {
  const phoneNumber = "+34912373521";
  const message = encodeURIComponent("Hola! Me gustaría reservar una cita en Chamberi Barber Shop");
  
  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full bg-gradient-accent shadow-glow hover:shadow-lg hover:scale-110 transition-all duration-300 group"
      size="icon"
    >
      <img 
        src={whatsappLogo} 
        alt="WhatsApp" 
        className="h-8 w-8 group-hover:scale-110 transition-transform duration-300" 
      />
    </Button>
  );
};

export default WhatsAppButton;