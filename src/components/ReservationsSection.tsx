import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROWS = 30;
const COLUMNS = ["NOMBRE DEL CLIENTE", "TIPO DE SERVICIO", "NÚMERO DE CONTACTO"];
const STORAGE_KEY = "reservations_locked";
const HOURS_KEY = "reservations_hours";
// IMPORTANTE: Reemplaza esta URL con la URL de tu Google Apps Script desplegado
const APPS_SCRIPT_URL = "";

const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let h = 11; h <= 19; h++) {
    for (let m = 0; m < 60; m += 20) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  slots.push("20:00");
  return slots;
};

const ALL_SLOTS = generateTimeSlots();

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
  const [hours, setHours] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(HOURS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locked));
  }, [locked]);

  useEffect(() => {
    localStorage.setItem(HOURS_KEY, JSON.stringify(hours));
  }, [hours]);

  const reservedSlots = useMemo(() => {
    return new Set(Object.values(hours));
  }, [hours]);

  const availableSlots = useMemo(() => {
    return ALL_SLOTS.filter((s) => !reservedSlots.has(s));
  }, [reservedSlots]);

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

  const handleHourSelect = (rowIndex: number, value: string) => {
    setHours((prev) => ({ ...prev, [rowIndex]: value }));
  };

  const handleAddCita = useCallback(async (rowIndex: number) => {
    const fecha = getTodayDate();
    const nombre = locked[`${rowIndex}-NOMBRE DEL CLIENTE`] || "";
    const servicio = locked[`${rowIndex}-TIPO DE SERVICIO`] || "";
    const contacto = locked[`${rowIndex}-NÚMERO DE CONTACTO`] || "";
    const hora = hours[rowIndex] || "";

    if (!APPS_SCRIPT_URL) {
      toast({ title: "Error", description: "URL del Apps Script no configurada.", variant: "destructive" });
      return;
    }

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fecha, nombre, servicio, contacto, hora }),
      });
      toast({ title: "Cita añadida", description: "Los datos se enviaron a la hoja de cálculo." });
    } catch {
      toast({ title: "Error", description: "No se pudo enviar la cita.", variant: "destructive" });
    }
  }, [locked, hours]);

  const isRowComplete = (rowIndex: number) => {
    return COLUMNS.every((col) => `${rowIndex}-${col}` in locked) && rowIndex in hours;
  };

  const handleClearClientData = () => {
    setLocked({});
    setDrafts({});
    setHours({});
  };

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Tabla de Reservas
          </h2>
          <button
            onClick={handleClearClientData}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm font-medium hover:opacity-90 transition"
          >
            Limpiar datos de clientes
          </button>
        </div>
        <div className="rounded-lg overflow-auto border border-border shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold text-foreground min-w-[130px]">
                  FECHA
                </TableHead>
                {COLUMNS.map((col) => (
                  <TableHead key={col} className="font-bold text-foreground min-w-[150px]">
                    {col}
                  </TableHead>
                ))}
                 <TableHead className="font-bold text-foreground min-w-[160px]">
                   HORA DE RESERVA
                 </TableHead>
                 <TableHead className="font-bold text-foreground min-w-[130px]">
                   ACCIÓN
                 </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: ROWS }, (_, i) => (
                <TableRow key={i}>
                  <TableCell className="p-1">
                    <span className="px-3 py-2 block text-foreground text-sm">
                      {getTodayDate()}
                    </span>
                  </TableCell>
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
                  <TableCell className="p-1">
                    {hours[i] ? (
                      <span className="px-3 py-2 block text-foreground text-sm font-medium">
                        {hours[i]}
                      </span>
                    ) : (
                      <Select onValueChange={(val) => handleHourSelect(i, val)}>
                        <SelectTrigger className="border-0 bg-transparent">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSlots.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="p-1">
                    <button
                      onClick={() => handleAddCita(i)}
                      disabled={!isRowComplete(i)}
                      className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Añadir Cita
                    </button>
                  </TableCell>
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
