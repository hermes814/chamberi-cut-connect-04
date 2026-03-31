import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ReservationsSection = () => {
  const rows = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-12">
          Tabla de Reservas
        </h2>
        <div className="rounded-lg overflow-auto border border-border shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold text-foreground min-w-[120px]">FECHA</TableHead>
                <TableHead className="font-bold text-foreground min-w-[180px]">NOMBRE DEL CLIENTE</TableHead>
                <TableHead className="font-bold text-foreground min-w-[160px]">TIPO DE SERVICIO</TableHead>
                <TableHead className="font-bold text-foreground min-w-[160px]">NÚMERO DE CONTACTO</TableHead>
                <TableHead className="font-bold text-foreground min-w-[140px]">HORA DE RESERVA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row}>
                  <TableCell className="text-foreground">&nbsp;</TableCell>
                  <TableCell className="text-foreground">&nbsp;</TableCell>
                  <TableCell className="text-foreground">&nbsp;</TableCell>
                  <TableCell className="text-foreground">&nbsp;</TableCell>
                  <TableCell className="text-foreground">&nbsp;</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
};

export default ReservationsSection;
