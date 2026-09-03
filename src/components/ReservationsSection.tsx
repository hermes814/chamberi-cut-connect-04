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
import { supabase } from "@/integrations/supabase/client";

const ROWS = 30;
const COLUMNS = ["NOMBRE DEL CLIENTE", "TIPO DE SERVICIO", "NÚMERO DE CONTACTO"];
const BARBEROS = ["Jorge", "Oscar"];
const STORAGE_KEY = "reservations_locked";
const HOURS_KEY = "reservations_hours";
const BARBERS_KEY = "reservations_barbers";

const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let h = 10; h <= 20; h++) {
    for (let m = 0; m < 60; m += 30) {
      const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      if (h === 20 && m > 30) break;
      slots.push(time);
    }
  }
  return slots;
};

const ALL_SLOTS = generateTimeSlots();

const getTodayDate = () => {
  const d = new Date();
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const getTodayISO = () =>
  new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" });

const isSunday = () => new Date().getDay() === 0;

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
  const [barbers, setBarbers] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(BARBERS_KEY);
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

  useEffect(() => {
    localStorage.setItem(BARBERS_KEY, JSON.stringify(barbers));
  }, [barbers]);

  // Horas ya reservadas en la base de datos (incluye las citas de Faruthel)
  const [dbBooked, setDbBooked] = useState<{ barbero: string; hora: string }[]>([]);

  const loadBooked = useCallback(async () => {
    const { data } = await supabase
      .from("citas")
      .select("barbero, fecha, hora")
      .eq("fecha", getTodayISO());
    if (data) setDbBooked(data.map((c) => ({ barbero: c.barbero, hora: c.hora })));
  }, []);

  useEffect(() => {
    loadBooked();

    // Actualización en tiempo real cuando Faruthel registra o cancela una cita
    const channel = supabase
      .channel("citas-tabla-reservas")
      .on("postgres_changes", { event: "*", schema: "public", table: "citas" }, () => {
        loadBooked();
      })
      .subscribe();

    // Respaldo: refresco periódico
    const interval = setInterval(loadBooked, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [loadBooked]);

  // Reservas hechas en la tabla (localStorage) por barbero
  const localBooked = useMemo(
    () =>
      Object.keys(hours)
        .filter((row) => hours[row])
        .map((row) => ({ row, barbero: barbers[row] || "", hora: hours[row] })),
    [hours, barbers]
  );

  const slotsForBarber = useCallback(
    (barbero: string, currentRow: number) => {
      const taken = new Set(
        [
          ...localBooked.filter((b) => b.row !== String(currentRow)),
          ...dbBooked.map((b) => ({ row: "", ...b })),
        ]
          .filter((b) => !barbero || !b.barbero || b.barbero === barbero)
          .map((b) => b.hora)
      );
      return ALL_SLOTS.filter((s) => !taken.has(s));
    },
    [localBooked, dbBooked]
  );

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

  const handleBarberSelect = (rowIndex: number, value: string) => {
    setBarbers((prev) => ({ ...prev, [rowIndex]: value }));
  };

  const handleAddCita = useCallback(
    async (rowIndex: number) => {
      const nombre = locked[`${rowIndex}-NOMBRE DEL CLIENTE`] || "";
      const servicio = locked[`${rowIndex}-TIPO DE SERVICIO`] || "";
      const telefono = locked[`${rowIndex}-NÚMERO DE CONTACTO`] || "";
      const hora = hours[rowIndex] || "";
      const barbero = barbers[rowIndex] || "";

      const { error } = await supabase.from("citas").insert({
        nombre,
        servicio,
        telefono,
        barbero,
        hora,
        fecha: getTodayISO(),
      });

      if (error) {
        toast({
          title: "No se pudo registrar",
          description: "Esa hora ya está reservada con ese barbero.",
          variant: "destructive",
        });
        loadBooked();
        return;
      }

      toast({
        title: "Cita añadida",
        description: `${nombre} · ${barbero} · ${hora}. La hora queda bloqueada.`,
      });
      loadBooked();
    },
    [locked, hours, barbers, loadBooked]
  );

  const isRowComplete = (rowIndex: number) => {
    return (
      COLUMNS.every((col) => `${rowIndex}-${col}` in locked) &&
      rowIndex in hours &&
      !!barbers[rowIndex]
    );
  };

  const handleClearClientData = () => {
    setLocked({});
    setDrafts({});
    setHours({});
    setBarbers({});
  };

  const closed = isSunday();

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Tabla de Reservas - Horario Verano
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
                <TableHead className="font-bold text-foreground min-w-[140px]">
                  BARBERO
                </TableHead>
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
                <TableRow key={i} className={hours[i] ? "bg-primary/5" : undefined}>
                  <TableCell className="p-1">
                    <span className="px-3 py-2 block text-foreground text-sm">
                      {closed ? `${getTodayDate()} - CERRADO` : getTodayDate()}
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
                            disabled={closed}
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
                    {closed ? (
                      <span className="px-3 py-2 block text-destructive text-sm font-medium">
                        CERRADO
                      </span>
                    ) : (
                      <Select
                        value={barbers[i] || undefined}
                        onValueChange={(val) => handleBarberSelect(i, val)}
                      >
                        <SelectTrigger className="border-0 bg-transparent">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {BARBEROS.map((b) => (
                            <SelectItem key={b} value={b}>
                              {b}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="p-1">
                    {hours[i] ? (
                      <div className="px-3 py-2 flex items-center gap-2">
                        <span className="text-foreground text-sm font-medium">{hours[i]}</span>
                        <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                          Reservada
                        </span>
                      </div>
                    ) : closed ? (
                      <span className="px-3 py-2 block text-destructive text-sm font-medium">
                        CERRADO
                      </span>
                    ) : (
                      <Select onValueChange={(val) => handleHourSelect(i, val)}>
                        <SelectTrigger className="border-0 bg-transparent">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {slotsForBarber(barbers[i] || "", i).map((slot) => (
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
                      disabled={closed || !isRowComplete(i)}
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
