import { Button } from "@/components/ui/button";
import whatsappLogo from "@/assets/whatsapp-logo.png";

const WhatsAppButton = () => {
  const phoneNumber = "+34648492221";
  const message = encodeURIComponent("Hola! Me gustaría reservar una cita en Chamberi Barber Shop");
  
  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <div
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 cursor-pointer hover:scale-110 transition-all duration-300 group"
    >
      <img 
        src={whatsappLogo} 
        alt="WhatsApp" 
        className="h-16 w-16 drop-shadow-lg group-hover:drop-shadow-xl transition-all duration-300" 
      />
    </div>
  );
};

export default WhatsAppButton;