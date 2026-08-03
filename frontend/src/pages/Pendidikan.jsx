import { useEffect, useMemo, useState } from "react";
import { Search, MapPin, BookOpen, GraduationCap } from "lucide-react";
import { supabase } from "@/lib/supabaseClient"; 
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Kategori tab dan nilainya yang akan dicocokkan dengan kolom jenis_sekolah di database
const SUBCATS = [
  { key: "all", label: "Semua", match: "" },
  { key: "paud", label: "PAUD", match: "PAUD" },
  { key: "tk", label: "TK", match: "TK" },
  { key: "sd", label: "SD", match: "SD" },
  { key: "smp", label: "SMP", match: "SMP" },
  { key: "sma_smk", label: "SMA/SMK", match: "SMA/SMK" },
];

export default function Pendidikan() {
  const [schools, setSchools] = useState([]);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("all");

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        // Mengambil data dari tabel 'pendidikan' di Supabase
        const { data, error } = await supabase
          .from("pendidikan")
          .select("*")
          .order("nama_sekolah", { ascending: true });

        if (error) throw error;
        if (data) setSchools(data);
      } catch (err) {
        console.error("Gagal memuat data pendidikan:", err);
      }
    };

    fetchSchools();
  }, []);

  const filtered = useMemo(() => {
    return schools.filter((school) => {
      // Filter berdasarkan Tab Kategori
      const activeTab = SUBCATS.find(t => t.key === tab);
      if (tab !== "all" && school.jenis_sekolah !== activeTab.match) return false;
      
      // Filter berdasarkan Pencarian
      if (!q) return true;
      const s = q.toLowerCase();
      return (
        school.nama_sekolah?.toLowerCase().includes(s) || 
        school.lokasi?.toLowerCase().includes(s)
      );
    });
  }, [schools, q, tab]);

  return (
    <div className="space-y-6" data-testid="pendidikan-page">
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-blue mb-2">
          <BookOpen className="h-4 w-4" /> Fasilitas Pendidikan
        </div>
        <h1 className="font-display font-bold text-3xl md:text-4xl">Data Sekolah & Institusi</h1>
        <p className="text-muted-foreground mt-1 max-w-xl">Daftar lengkap institusi pendidikan mulai dari PAUD hingga SMA/SMK di wilayah kelurahan.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama sekolah atau lokasi..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-10 min-h-[44px]"
            data-testid="input-search-pendidikan"
          />
        </div>
        {/* Overflow di-set agar tab bisa di-scroll horizontal di layar hp */}
        <div className="overflow-x-auto pb-1">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList data-testid="tabs-pendidikan-category" className="w-full justify-start">
              {SUBCATS.map((s) => (
                <TabsTrigger key={s.key} value={s.key} data-testid={`tab-pendidikan-${s.key}`}>
                  {s.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" data-testid="pendidikan-grid">
        {filtered.map((school) => (
          <Card key={school.id} className="card-hover overflow-hidden" data-testid={`pendidikan-card-${school.id}`}>
            <div className="brand-blue h-1.5" />
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Avatar className="h-14 w-14 border-2 border-secondary/30 bg-muted flex items-center justify-center">
                  <AvatarFallback className="bg-transparent">
                    <GraduationCap className="h-6 w-6 text-brand-blue" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-xs uppercase tracking-widest text-brand-blue font-semibold">{school.jenis_sekolah}</div>
                  <div className="font-display font-semibold text-base truncate">{school.nama_sekolah}</div>
                  
                  <div className="mt-3 flex items-start gap-2 text-xs p-2 rounded-md bg-muted">
                    <MapPin className="h-4 w-4 mt-0.5 text-brand-blue shrink-0" />
                    <span className="leading-relaxed">{school.lokasi}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground" data-testid="empty-pendidikan">
            Tidak ada data pendidikan yang cocok dengan pencarian Anda.
          </div>
        )}
      </div>
    </div>
  );
}