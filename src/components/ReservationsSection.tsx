const ReservationsSection = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-12">
          Tabla de Reservas
        </h2>
        <div className="rounded-lg overflow-hidden border border-border shadow-card">
          <iframe
            src="https://docs.google.com/spreadsheets/d/1wK5DDEBbMMiSA958NzYYPJ2sXMGpm6vq7fGQFCf7KU0/pubhtml?widget=true&headers=false"
            className="w-full min-h-[500px] md:min-h-[600px]"
            title="Tabla de Reservas Chamberi Barbershop"
          />
        </div>
      </div>
    </section>
  );
};

export default ReservationsSection;
