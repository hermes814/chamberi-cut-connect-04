import { useState, useEffect, useMemo } from "react";
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
const COLUMNS = ["NOMBRE DEL CLIENTE", "TIPO DE SERVICIO", "NÚMERO DE CONTACTO"];
const STORAGE_KEY = "reservations_locked";

const getTodayDate = () => {
  const d = new Date();
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const ReservationsSection = () => {
  const [locked, setLocked] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locked));
  }, [locked]);

  const handleBlur = (key: string) => {
    const val = (drafts[key] || "").trim();
    if (val) {
      setLocked((prev) => ({ ...prev, [key]: val }));
      setDrafts((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
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
                    const isLocked = key in locked;
                    return (
                      <TableCell key={col} className="p-1">
                        {isLocked ? (
                          <span className="px-3 py-2 block text-foreground text-sm">
                            {locked[key]}
                          </span>
                        ) : (
                          <Input
                            className="border-0 bg-transparent focus-visible:ring-1"
                            value={drafts[key] || ""}
                            onChange={(e) =>
                              setDrafts((prev) => ({ ...prev, [key]: e.target.value }))
                            }
                            onBlur={() => handleBlur(key)}
                          />
                        )}
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
