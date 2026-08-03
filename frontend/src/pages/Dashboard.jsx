import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import { Link } from "react-router-dom";
import { Users, Home, MapPin, Building2, ArrowRight, Siren, Megaphone, Calendar, Phone } from "lucide-react";
import { supabase } from "@/lib/supabaseClient"; // Menggunakan Supabase murni
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function Stat({ icon: Icon, label, value, accent, testid }) {
  return (
    <Card className="card-hover" data-testid={testid}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{label}</div>
            <div className="font-display font-bold text-3xl mt-2 tabular-nums">{value}</div>
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [info, setInfo] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [agenda, setAgenda] = useState([]);
  const [emergency, setEmergency] = useState([]);
  const [loading, setLoading] = useState(true); // Menahan proses render sampai data siap

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [infoRes, annRes, agRes, contactRes] = await Promise.all([
          supabase.from("info").select("*").eq("id", 1).maybeSingle(),
          supabase.from("announcements").select("*").order("id", { ascending: false }),
          supabase.from("agenda").select("*").order("id", { ascending: false }),
          supabase.from("contacts").select("*").eq("category", "emergency").limit(4)
        ]);

        if (infoRes.data) setInfo(infoRes.data);
        if (annRes.data) setAnnouncements(annRes.data);
        if (agRes.data) setAgenda(agRes.data);
        if (contactRes.data) setEmergency(contactRes.data);
      } catch (err) {
        console.error("Gagal menarik data Supabase pada Dashboard:", err);
      } finally {
        setLoading(false); // Mematikan layar loading setelah semua data ditarik
      }
    };

    loadDashboardData();
  }, []);

  // Tampilkan layar loading saat data belum siap
  if (loading) {
    return (
      <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-t-4 border-blue-600 border-solid"></div>
        <p className="text-sm text-muted-foreground animate-pulse">Sinkronisasi Data Dashboard...</p>
      </div>
    );
  }

  const urgent = announcements.filter((a) => a.priority === "urgent");
  const marqueeText = announcements.length
    ? announcements.map((a) => `${a.priority === "urgent" ? "🚨" : "📢"} ${a.title}: ${a.body}`).join("   •   ")
    : "Selamat datang di Portal Warga Kelurahan";

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border bg-card">
        <div className="grid-pattern absolute inset-0 opacity-40" />
        <div className="relative px-6 py-8 md:py-10">
          <div className="inline-block px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-semibold uppercase tracking-widest mb-3" data-testid="hero-badge">
            Portal Resmi Warga
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl leading-tight" data-testid="hero-title">
            {info?.name || "Kelurahan SukaMaju"}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            {info?.wilayah || "Kec. Sejahtera, Kota Bahagia"} — informasi kontak darurat, kader, agenda kegiatan, dan pengumuman terkini untuk seluruh warga.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <Link to="/darurat">
              <Button className="brand-red hover:brightness-90 gap-2 min-h-[44px] font-semibold" data-testid="btn-hero-emergency">
                <Siren className="h-4 w-4" /> Kontak Darurat
              </Button>
            </Link>
            <Link to="/pengumuman">
              <Button variant="outline" className="gap-2 min-h-[44px]" data-testid="btn-hero-announcements">
                <Megaphone className="h-4 w-4" /> Lihat Pengumuman
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Announcements ticker */}
      <div className="rounded-xl border overflow-hidden bg-card" data-testid="announcements-ticker">
        <div className="flex items-stretch">
          <div className="brand-orange px-4 flex items-center gap-2 font-semibold text-sm shrink-0">
            <Megaphone className="h-4 w-4" /> INFO
          </div>
          <Marquee gradient={false} speed={40} pauseOnHover className="py-3">
            <span className="text-sm mr-16">{marqueeText}</span>
          </Marquee>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="stats-grid">
        <Stat icon={Home} label="Total KK" value={info?.total_kk?.toLocaleString("id-ID") || "-"} accent="brand-blue" testid="stat-kk" />
        <Stat icon={Users} label="Penduduk" value={info?.total_penduduk?.toLocaleString("id-ID") || "-"} accent="brand-green" testid="stat-penduduk" />
        <Stat icon={Building2} label="RT / RW" value={`${info?.total_rt || 0} / ${info?.total_rw || 0}`} accent="brand-orange" testid="stat-rtrw" />
        <Stat icon={MapPin} label="Wilayah" value={info?.total_rw || 0} accent="brand-red" testid="stat-wilayah" />
      </div>

      {/* Emergency preview + Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-xl flex items-center gap-2">
              <Siren className="h-5 w-5 text-brand-red" /> Kontak Darurat Utama
            </h2>
            <Link to="/darurat" className="text-sm font-medium text-brand-blue dark:text-primary flex items-center gap-1 hover:underline" data-testid="link-all-emergency">
              Semua <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {emergency.map((c) => (
              <Card key={c.id} className="border-l-4 border-l-red-600 card-hover" data-testid={`emergency-preview-${c.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-brand-red font-semibold">{c.subcategory ? c.subcategory.replace("_", "/") : ""}</div>
                      <div className="font-display font-semibold mt-1">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.role}</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className={`status-dot status-${c.status}`} />
                      <span className="capitalize text-muted-foreground">{c.status === "available" ? "Siap" : c.status === "busy" ? "Sibuk" : "Offline"}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <a href={`tel:${c.phone}`} className="flex-1" data-testid={`btn-call-${c.id}`}>
                      <Button size="sm" className="w-full brand-red hover:brightness-90 gap-1 min-h-[40px]">
                        <Phone className="h-3.5 w-3.5" /> Telepon
                      </Button>
                    </a>
                    {c.whatsapp && (
                      <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noreferrer" className="flex-1" data-testid={`btn-wa-${c.id}`}>
                        <Button size="sm" variant="outline" className="w-full gap-1 min-h-[40px] border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20">
                          WhatsApp
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-display font-semibold text-xl flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand-green" /> Agenda Terdekat
          </h2>
          <Card>
            <CardContent className="p-0 divide-y" data-testid="agenda-list">
              {agenda.slice(0, 5).map((a) => (
                <div key={a.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-lg bg-secondary/10 text-secondary flex flex-col items-center justify-center font-display shrink-0">
                      <div className="text-[10px] font-semibold uppercase leading-none">
                        {a.date ? new Date(a.date).toLocaleDateString("id-ID", { month: "short" }) : ""}
                      </div>
                      <div className="font-bold text-base leading-none">
                        {a.date ? new Date(a.date).getDate() : ""}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm">{a.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{a.time} · {a.location}</div>
                    </div>
                  </div>
                </div>
              ))}
              {agenda.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">Belum ada agenda</div>}
            </CardContent>
          </Card>
        </div>
      </div>

      {urgent.length > 0 && (
        <Card className="border-l-4 border-l-red-600" data-testid="urgent-announcements">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="brand-red hover:brightness-90">URGENT</Badge>
              <h3 className="font-display font-semibold">Pengumuman Penting</h3>
            </div>
            <ul className="space-y-2 text-sm">
              {urgent.slice(0, 3).map((a) => (
                <li key={a.id} className="border-l-2 border-red-300 pl-3">
                  <div className="font-semibold">{a.title}</div>
                  <div className="text-muted-foreground">{a.body}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}