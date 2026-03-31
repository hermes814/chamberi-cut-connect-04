import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

const ROWS = 30;
const COLUMNS = ["FECHA", "NOMBRE DEL CLIENTE", "TIPO DE SERVICIO", "NÚMERO DE CONTACTO"];
const STORAGE_KEY = "reservations_data";

type CellData = Record<string, string>;

const ReservationsSection = () => {
  const [data, setData] = useState<CellData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const handleChange = (row: number, col: string, value: string) => {
    const key = `${row}-${col}`;
    // Only allow writing if cell is empty (not yet saved)
    if (data[key]) return;
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleBlur = (row: number, col: string, value: string) => {
    const key = `${row}-${col}`;
    if (value.trim() && !data[key]) {
      setData((prev) => ({ ...prev, [key]: value.trim() }));
    }
  };

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
                {COLUMNS.map((col) => (
                  <TableHead key={col} className="font-bold text-foreground min-w-[150px]">
                    {col}
                  </TableHead>
                ))}
                <TableHead className="font-bold text-foreground min-w-[140px]">
                  HORA DE RESERVA
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: ROWS }, (_, i) => (
                <TableRow key={i}>
                  {COLUMNS.map((col) => {
                    const key = `${i}-${col}`;
                    const locked = !!data[key];
                    return (
                      <TableCell key={col} className="p-1">
                        <Input
                          className={`border-0 bg-transparent focus-visible:ring-1 ${locked ? "cursor-not-allowed opacity-80" : ""}`}
                          value={data[key] || ""}
                          readOnly={locked}
                          onChange={(e) => {
                            if (!locked) {
                              const val = e.target.value;
                              setData((prev) => ({ ...prev, [key]: "" }));
                              // Store temporarily without locking
                              setData((prev) => {
                                const copy = { ...prev };
                                delete copy[key];
                                return { ...copy, [`_draft_${key}`]: val };
                              });
                            }
                          }}
                          onBlur={(e) => {
                            const draftKey = `_draft_${key}`;
                            const val = e.target.value.trim();
                            if (val) {
                              setData((prev) => {
                                const copy = { ...prev };
                                delete copy[draftKey];
                                return { ...copy, [key]: val };
                              });
                            } else {
                              setData((prev) => {
                                const copy = { ...prev };
                                delete copy[draftKey];
                                return copy;
                              });
                            }
                          }}
                        />
                      </TableCell>
                    );
                  })}
                  <TableCell className="p-1 text-muted-foreground text-center">—</TableCell>
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
