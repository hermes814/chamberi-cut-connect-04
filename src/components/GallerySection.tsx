const GallerySection = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Nuestro Ambiente
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Un espacio moderno y acogedor diseñado para tu comodidad
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative group overflow-hidden rounded-lg shadow-card">
            <img 
              src="/lovable-uploads/e1a9d21d-6614-4088-b7b3-08e6ef3f2358.png"
              alt="Interior de Chamberi Barber Shop - Área principal"
              className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <h3 className="text-white text-xl font-semibold">Área Principal</h3>
              <p className="text-gray-300">Ambiente relajado y profesional</p>
            </div>
          </div>
          
          <div className="relative group overflow-hidden rounded-lg shadow-card">
            <img 
              src="/lovable-uploads/2ea73f30-6511-4aab-9969-79731b7565da.png"
              alt="Interior de Chamberi Barber Shop - Zona de trabajo"
              className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <h3 className="text-white text-xl font-semibold">Zona de Trabajo</h3>
              <p className="text-gray-300">Equipamiento profesional de última generación</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;