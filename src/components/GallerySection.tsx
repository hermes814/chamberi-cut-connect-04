const galleryImages = [
  {
    src: "/lovable-uploads/gallery-1.jpeg",
    alt: "Interior de Chamberi Barber Shop - Iluminación LED hexagonal",
    title: "Diseño Único",
    description: "Iluminación LED moderna"
  },
  {
    src: "/lovable-uploads/gallery-2.jpeg",
    alt: "Interior de Chamberi Barber Shop - Estaciones de trabajo",
    title: "Estaciones Premium",
    description: "Equipamiento profesional"
  },
  {
    src: "/lovable-uploads/gallery-3.jpeg",
    alt: "Interior de Chamberi Barber Shop - Vista completa del salón",
    title: "Ambiente Completo",
    description: "Espacio amplio y moderno"
  },
  {
    src: "/lovable-uploads/gallery-4.jpeg",
    alt: "Interior de Chamberi Barber Shop - Zona de corte con espejos",
    title: "Zona de Corte",
    description: "Espejos profesionales"
  },
  {
    src: "/lovable-uploads/gallery-5.jpeg",
    alt: "Interior de Chamberi Barber Shop - Área de servicio",
    title: "Área de Servicio",
    description: "Productos de primera calidad"
  },
  {
    src: "/lovable-uploads/gallery-6.jpeg",
    alt: "Interior de Chamberi Barber Shop - Vista panorámica",
    title: "Vista Panorámica",
    description: "Instalaciones de lujo"
  },
  {
    src: "/lovable-uploads/gallery-7.jpeg",
    alt: "Interior de Chamberi Barber Shop - Estaciones con vista a la calle",
    title: "Vista Exterior",
    description: "Ambiente luminoso"
  },
  {
    src: "/lovable-uploads/gallery-8.jpeg",
    alt: "Interior de Chamberi Barber Shop - Techo con LED hexagonal",
    title: "Techo LED",
    description: "Diseño arquitectónico único"
  }
];

const GallerySection = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Nuestro Ambiente
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Un espacio moderno y acogedor diseñado para tu comodidad
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <div key={index} className="relative group overflow-hidden rounded-lg shadow-card">
              <img 
                src={image.src}
                alt={image.alt}
                className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <h3 className="text-white text-lg font-semibold">{image.title}</h3>
                <p className="text-gray-300 text-sm">{image.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;