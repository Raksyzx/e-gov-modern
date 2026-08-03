import { useEffect, useState } from "react";
import { Megaphone, Calendar, MapPin, Clock } from "lucide-react";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Announcements() {
  const [items, setItems] = useState([]);
  const [agenda, setAgenda] = useState([]);

  useEffect(() => {
    api.get("/announcements").then((r) => setItems(r.data));
    api.get("/agenda").then((r) => setAgenda(r.data));
  }, []);

  return (
    <div className="space-y-8" data-testid="announcements-page">
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-orange mb-2">
          <Megaphone className="h-4 w-4" /> Informasi Kelurahan
        </div>
        <h1 className="font-display font-bold text-3xl md:text-4xl">Pengumuman & Agenda</h1>
        <p className="text-muted-foreground mt-1">Informasi terkini seputar kegiatan dan pengumuman kelurahan.</p>
      </div>

      <section className="space-y-4">
        <h2 className="font-display font-semibold text-xl flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-brand-orange" /> Pengumuman
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="announcements-list">
          {items.map((a) => (
            <Card key={a.id} className={`card-hover ${a.priority === "urgent" ? "border-l-4 border-l-red-600" : ""}`} data-testid={`announcement-${a.id}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-display font-semibold text-lg">{a.title}</h3>
                  {a.priority === "urgent" ? (
                    <Badge className="brand-red hover:brightness-90 shrink-0">Urgent</Badge>
                  ) : (
                    <Badge variant="secondary" className="shrink-0">Info</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{a.body}</p>
                <div className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {new Date(a.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </div>
              </CardContent>
            </Card>
          ))}
          {items.length === 0 && <div className="col-span-full text-center py-8 text-muted-foreground">Belum ada pengumuman</div>}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display font-semibold text-xl flex items-center gap-2">
          <Calendar className="h-5 w-5 text-brand-green" /> Agenda Kegiatan
        </h2>
        <Card>
          <CardContent className="p-0 divide-y" data-testid="agenda-full-list">
            {agenda.map((a) => (
              <div key={a.id} className="p-5 hover:bg-muted/50 transition-colors flex items-start gap-4" data-testid={`agenda-${a.id}`}>
                <div className="w-14 h-14 rounded-lg bg-secondary/10 text-secondary flex flex-col items-center justify-center font-display shrink-0">
                  <div className="text-[10px] font-semibold uppercase leading-none">{new Date(a.date).toLocaleDateString("id-ID", { month: "short" })}</div>
                  <div className="font-bold text-lg leading-none mt-0.5">{new Date(a.date).getDate()}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-semibold">{a.title}</div>
                  <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {a.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {a.location}</span>
                  </div>
                  {a.description && <p className="text-sm mt-2 text-muted-foreground">{a.description}</p>}
                </div>
              </div>
            ))}
            {agenda.length === 0 && <div className="p-8 text-center text-muted-foreground">Belum ada agenda</div>}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
