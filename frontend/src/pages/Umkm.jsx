import { useEffect, useMemo, useState } from "react";
import { Phone, MessageCircle, Search, Store, MapPin, Award, FileText, Wallet } from "lucide-react";
import { supabase } from "@/lib/supabaseClient"; 
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Menyiapkan kategori tab untuk kemudahan penyaringan
const SUBCATS = [
  { key: "all", label: "Semua" },
  { key: "sertifikat", label: "Ada Sertifikat" },
  { key: "nib", label: "Ada NIB" },
];

export default function Umkm() {
  const [umkmList, setUmkmList] = useState([]);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("all");

  useEffect(() => {
    const fetchUmkm = async () => {
      try {
        const { data, error } = await supabase
          .from("umkm")
          .select("*")
          .order("nama_umkm", { ascending: true });

        if (error) throw error;
        if (data) setUmkmList(data);
      } catch (err) {
        console.error("Gagal memuat data UMKM:", err);
      }
    };

    fetchUmkm();
  }, []);

  const filtered = useMemo(() => {
    return umkmList.filter((item) => {
      // Filter berdasarkan Tab Kategori
      if (tab === "sertifikat" && !item.sertifikat) return false;
      if (tab === "nib" && !item.nib_status) return false;
      
      // Filter berdasarkan Pencarian text
      if (!q) return true;
      const s = q.toLowerCase();
      return (
        item.nama_umkm?.toLowerCase().includes(s) || 
        item.nama_pemilik?.toLowerCase().includes(s) || 
        item.alamat?.toLowerCase().includes(s)
      );
    });
  }, [umkmList, q, tab]);

  return (
    <div className="space-y-6" data-testid="umkm-page">
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-orange-600 mb-2">
          <Store className="h-4 w-4" /> Pemberdayaan Ekonomi
        </div>
        <h1 className="font-display font-bold text-3xl md:text-4xl">Katalog UMKM Warga</h1>
        <p className="text-muted-foreground mt-1 max-w-xl">Daftar Usaha Mikro Kecil dan Menengah di wilayah kelurahan beserta status legalitasnya.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama UMKM, pemilik, atau alamat..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-10 min-h-[44px]"
            data-testid="input-search-umkm"
          />
        </div>
        <div className="overflow-x-auto pb-1">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList data-testid="tabs-umkm-category" className="w-full justify-start">
              {SUBCATS.map((s) => (
                <TabsTrigger key={s.key} value={s.key} data-testid={`tab-umkm-${s.key}`}>
                  {s.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="umkm-grid">
        {filtered.map((item) => (
          <Card key={item.id} className="card-hover overflow-hidden flex flex-col" data-testid={`umkm-card-${item.id}`}>
            <div className="bg-orange-500 h-1.5" />
            <CardContent className="p-5 flex-1 flex flex-col">
              <div className="flex items-start gap-3 mb-4">
                <Avatar className="h-14 w-14 border-2 border-secondary/30 bg-muted flex items-center justify-center">
                  <AvatarFallback className="bg-transparent">
                    <Store className="h-6 w-6 text-orange-500" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-semibold text-lg leading-tight truncate">{item.nama_umkm}</div>
                  <div className="text-sm text-muted-foreground mt-0.5">Pemilik: <span className="font-medium text-foreground">{item.nama_pemilik}</span></div>
                </div>
              </div>
              
              <div className="space-y-2 mb-4 flex-1 p-3 rounded-md bg-muted/50 border border-border/50">
                <div className="flex items-start gap-2 text-xs">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 text-orange-600 shrink-0" />
                  <span className="leading-relaxed">{item.alamat}</span>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <FileText className="h-3.5 w-3.5 mt-0.5 text-orange-600 shrink-0" />
                  <span>NIB: <span className="font-medium">{item.nib_status ? `ADA (${item.nib_nomor})` : "TIDAK ADA"}</span></span>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <Award className="h-3.5 w-3.5 mt-0.5 text-orange-600 shrink-0" />
                  <span>Sertifikat: <span className="font-medium">{item.sertifikat ? "ADA" : "TIDAK ADA"}</span></span>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <Wallet className="h-3.5 w-3.5 mt-0.5 text-orange-600 shrink-0" />
                  <span>Omset: <span className="font-medium">{item.omset_jumlah} ({item.omset_periode})</span></span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-auto">
                <a href={`tel:${item.no_hp}`} data-testid={`umkm-call-${item.id}`}>
                  <Button size="sm" variant="outline" className="w-full gap-1 min-h-[44px]">
                    <Phone className="h-4 w-4" /> Telepon
                  </Button>
                </a>
                <a href={`https://wa.me/${item.no_hp}`} target="_blank" rel="noreferrer" data-testid={`umkm-wa-${item.id}`}>
                  <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-1 min-h-[44px]">
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground" data-testid="empty-umkm">
            Tidak ada data UMKM yang cocok dengan pencarian Anda.
          </div>
        )}
      </div>
    </div>
  );
}