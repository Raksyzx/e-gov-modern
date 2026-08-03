import { useEffect, useMemo, useState } from "react";
import { Phone, MessageCircle, Search, Calendar, Users } from "lucide-react";
import { supabase } from "@/lib/supabaseClient"; // Menggunakan Supabase murni
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const SUBCATS = [
  { key: "all", label: "Semua" },
  { key: "posyandu", label: "Posyandu" },
  { key: "pkk", label: "PKK" },
  { key: "linmas", label: "Linmas" },
];

export default function Kader() {
  const [contacts, setContacts] = useState([]);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("all");

  useEffect(() => {
    const fetchKaderContacts = async () => {
      try {
        // Melakukan pemfilteran data category = kader menggunakan sintaks Supabase SDK
        const { data, error } = await supabase
          .from("contacts")
          .select("*")
          .eq("category", "kader");

        if (error) throw error;
        if (data) setContacts(data);
      } catch (err) {
        console.error("Gagal memuat data kontak kader:", err);
      }
    };

    fetchKaderContacts();
  }, []);

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      if (tab !== "all" && c.subcategory !== tab) return false;
      if (!q) return true;
      const s = q.toLowerCase();
      return (
        c.name?.toLowerCase().includes(s) || 
        c.role?.toLowerCase().includes(s) || 
        c.wilayah?.toLowerCase().includes(s)
      );
    });
  }, [contacts, q, tab]);

  return (
    <div className="space-y-6" data-testid="kader-page">
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-green mb-2">
          <Users className="h-4 w-4" /> Petugas & Kader
        </div>
        <h1 className="font-display font-bold text-3xl md:text-4xl">Info Kader Kelurahan</h1>
        <p className="text-muted-foreground mt-1 max-w-xl">Kader Posyandu, PKK, dan Linmas — jadwal kegiatan dan kontak lengkap.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari kader berdasarkan nama, jabatan, atau RT/RW..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-10 min-h-[44px]"
            data-testid="input-search-kader"
          />
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList data-testid="tabs-kader-category">
            {SUBCATS.map((s) => (
              <TabsTrigger key={s.key} value={s.key} data-testid={`tab-kader-${s.key}`}>{s.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="kader-grid">
        {filtered.map((c) => (
          <Card key={c.id} className="card-hover overflow-hidden" data-testid={`kader-card-${c.id}`}>
            <div className="brand-green h-1.5" />
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Avatar className="h-14 w-14 border-2 border-secondary/30">
                  {c.photo_url ? <AvatarImage src={c.photo_url} alt={c.name} /> : null}
                  <AvatarFallback className="brand-green font-display">{c.name ? c.name.charAt(0) : "K"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-xs uppercase tracking-widest text-brand-green font-semibold">{c.subcategory}</div>
                  <div className="font-display font-semibold text-base">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.role}</div>
                  {c.wilayah && <div className="text-xs mt-1 font-medium">{c.wilayah}</div>}
                </div>
              </div>
              {c.schedule && (
                <div className="mt-3 flex items-start gap-2 text-xs p-2 rounded-md bg-muted">
                  <Calendar className="h-3.5 w-3.5 mt-0.5 text-brand-green shrink-0" />
                  <span>{c.schedule}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <a href={`tel:${c.phone}`} data-testid={`kader-call-${c.id}`}>
                  <Button size="sm" variant="outline" className="w-full gap-1 min-h-[44px]">
                    <Phone className="h-4 w-4" /> Telepon
                  </Button>
                </a>
                {c.whatsapp && (
                  <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noreferrer" data-testid={`kader-wa-${c.id}`}>
                    <Button size="sm" className="w-full brand-green hover:brightness-90 gap-1 min-h-[44px]">
                      <MessageCircle className="h-4 w-4" /> WhatsApp
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground" data-testid="empty-kader">
            Tidak ada kader yang cocok
          </div>
        )}
      </div>
    </div>
  );
}