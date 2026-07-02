import whatsappLogo from "@/assets/whatsapp-logo.png";

const WhatsAppButton = () => {
  const handleClick = () => {
    const phoneNumber = "34603912086";
    const message = encodeURIComponent("Hola! Me gustaría reservar una cita en Chamberi Barber Shop");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Reservar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 cursor-pointer hover:scale-110 transition-all duration-300 group"
    >
      <img
        src={whatsappLogo}
        alt="WhatsApp"
        className="h-16 w-16 drop-shadow-lg group-hover:drop-shadow-xl transition-all duration-300"
      />
    </button>
  );
};

export default WhatsAppButton;
