import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PricingSection = () => {
  const mainServices = [
    { name: "CORTE + BARBA + CEJAS", price: "20 EUR" },
    { name: "CORTE + CEJAS", price: "15 EUR" },
    { name: "CORTE + BARBA", price: "18 EUR" },
    { name: "CORTE", price: "12 EUR" },
    { name: "CORTE PARA NIÑOS", price: "9 EUR" },
  ];

  const extraServices = [
    { name: "BARBA", price: "9 EUR" },
    { name: "CEJAS", price: "3 EUR" },
  ];

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-12">
          SERVICIOS
        </h2>
        
        <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-lg font-semibold text-foreground">Servicio</TableHead>
                <TableHead className="text-right text-lg font-semibold text-foreground">Precio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mainServices.map((service, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-foreground">{service.name}</TableCell>
                  <TableCell className="text-right text-electric-blue font-semibold">{service.price}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/30">
                <TableCell colSpan={2} className="text-center font-bold text-foreground py-4">
                  SERVICIOS EXTRAS
                </TableCell>
              </TableRow>
              {extraServices.map((service, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-foreground">{service.name}</TableCell>
                  <TableCell className="text-right text-electric-blue font-semibold">{service.price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
