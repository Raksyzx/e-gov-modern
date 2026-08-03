import { useEffect, useState } from "react";
import { Plus, Trash2, Shield, Pencil, ExternalLink, Monitor, Tablet, Smartphone, Send, RotateCcw, AlertCircle, History, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient"; 
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Uploader from "@/components/Uploader";

const EMPTY_CONTACT = {
  category: "emergency", subcategory: "rt_rw", name: "", role: "", phone: "",
  whatsapp: "", wilayah: "", status: "available", schedule: "", notes: "", photo_url: "",
};
// Tambahkan field nip: ""
const EMPTY_PENGURUS = { name: "", position: "", photo_url: "", phone: "", email: "", bio: "", nip: "", order: 0 };
const EMPTY_PENDIDIKAN = { nama_sekolah: "", jenis_sekolah: "SD", lokasi: "" };
const EMPTY_UMKM = { nama_pemilik: "", nama_umkm: "", alamat: "", sertifikat: false, nib_status: false, nib_nomor: "", omset_jumlah: "", omset_periode: "Bulanan", no_hp: "" };

const STRUCTURAL_ROLES = [
  { id: "Lurah", label: "Kepala Kelurahan (Lurah)", pos: "Kepala Kelurahan", ord: 1 },
  { id: "Sekdes", label: "Sekretaris Kelurahan", pos: "Sekretaris Kelurahan", ord: 2 },
  { id: "Kasi Pem", label: "Kasi Pemerintahan Umum & Pelayanan Publik", pos: "Kasi Pemerintahan Umum dan Pelayanan Publik", ord: 10 },
  { id: "Pranata", label: "Pranata Kewilayahan", pos: "Pranata Kewilayahan", ord: 11 },
  { id: "Penata", label: "Penata Layanan Operasional", pos: "Penata Layanan Operasional", ord: 12 },
  { id: "Op Pem", label: "Operator Layanan (Bag. Pemerintahan)", pos: "Operator Layanan Operasional", ord: 13 },
  { id: "Kasi Day", label: "Kasi Pemberdayaan", pos: "Kasi Pemberdayaan", ord: 20 },
  { id: "Op Day", label: "Operator Layanan (Bag. Pemberdayaan)", pos: "Operator Layanan Operasional", ord: 21 },
  { id: "Kasi Tib", label: "Kasi Ketertiban dan Keamanan", pos: "Kasi Ketertiban dan Keamanan", ord: 30 },
  { id: "Op Tib", label: "Operator Layanan (Bag. Ketertiban)", pos: "Operator Layanan Operasional", ord: 31 },
];

function ContactForm({ initial, onSubmit }) {
  const [f, setF] = useState(initial || EMPTY_CONTACT);
  const update = (k, v) => setF({ ...f, [k]: v });
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <Label>Kategori</Label>
        <Select value={f.category} onValueChange={(v) => update("category", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="emergency">Darurat</SelectItem><SelectItem value="kader">Kader</SelectItem></SelectContent>
        </Select>
      </div>
      <div><Label>Sub-kategori</Label><Input value={f.subcategory} onChange={(e) => update("subcategory", e.target.value)} placeholder="rt_rw / ambulan / posyandu ..." /></div>
      <div className="col-span-2"><Label>Nama</Label><Input value={f.name} onChange={(e) => update("name", e.target.value)} /></div>
      <div className="col-span-2"><Label>Jabatan / Role</Label><Input value={f.role} onChange={(e) => update("role", e.target.value)} /></div>
      <div><Label>Telepon</Label><Input value={f.phone} onChange={(e) => update("phone", e.target.value)} /></div>
      <div><Label>WhatsApp</Label><Input value={f.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} placeholder="628..." /></div>
      <div><Label>Wilayah</Label><Input value={f.wilayah} onChange={(e) => update("wilayah", e.target.value)} /></div>
      <div>
        <Label>Status</Label>
        <Select value={f.status} onValueChange={(v) => update("status", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="available">Siap</SelectItem><SelectItem value="busy">Sibuk</SelectItem><SelectItem value="offline">Offline</SelectItem></SelectContent>
        </Select>
      </div>
      <div className="col-span-2"><Label>Jadwal</Label><Input value={f.schedule || ""} onChange={(e) => update("schedule", e.target.value)} /></div>
      <div className="col-span-2"><Label>URL Foto</Label><Input value={f.photo_url || ""} onChange={(e) => update("photo_url", e.target.value)} /></div>
      <div className="col-span-2"><Label>Catatan</Label><Textarea value={f.notes || ""} onChange={(e) => update("notes", e.target.value)} /></div>
      <div className="col-span-2 flex justify-end"><Button onClick={() => onSubmit(f)} className="brand-blue hover:brightness-90">Simpan</Button></div>
    </div>
  );
}

function PengurusForm({ initial, prefilledRole, onSubmit }) {
  const [f, setF] = useState(() => {
    if (initial) return initial;
    const defaultRole = STRUCTURAL_ROLES.find(r => r.id === prefilledRole);
    return { ...EMPTY_PENGURUS, position: defaultRole?.pos || "", order: defaultRole?.ord || 0 };
  });

  const [roleId, setRoleId] = useState(() => {
    if (initial) {
      if (initial.order === 1) return "Lurah";
      if (initial.order === 2) return "Sekdes";
      if (initial.order === 10) return "Kasi Pem";
      if (initial.order === 11) return "Pranata";
      if (initial.order === 12) return "Penata";
      if (initial.order === 13) return "Op Pem";
      if (initial.order === 20) return "Kasi Day";
      if (initial.order === 21) return "Op Day";
      if (initial.order === 30) return "Kasi Tib";
      if (initial.order === 31) return "Op Tib";
      if (initial.position?.includes("Lurah") || initial.position?.includes("Kepala Kelurahan")) return "Lurah";
      if (initial.position?.includes("Sekretaris")) return "Sekdes";
    }
    return prefilledRole || "";
  });

  const update = (k, v) => setF({ ...f, [k]: v });

  const handleRoleChange = (id) => {
    setRoleId(id);
    const role = STRUCTURAL_ROLES.find(r => r.id === id);
    if (role) setF({ ...f, position: role.pos, order: role.ord });
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2"><Label>Nama Lengkap</Label><Input value={f.name} onChange={(e) => update("name", e.target.value)} /></div>
      <div className="col-span-2">
        <Label>Posisi Struktural (Menentukan Letak di Bagan)</Label>
        <Select value={roleId} onValueChange={handleRoleChange}>
          <SelectTrigger><SelectValue placeholder="Pilih penempatan di bagan..." /></SelectTrigger>
          <SelectContent>
            {STRUCTURAL_ROLES.map(r => (
              <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div><Label>Telepon</Label><Input value={f.phone || ""} onChange={(e) => update("phone", e.target.value)} /></div>
      <div><Label>Email</Label><Input value={f.email || ""} onChange={(e) => update("email", e.target.value)} /></div>
      
      {/* Kolom NIP baru terpisah */}
      <div className="col-span-2">
        <Label>Nomor Induk Pegawai (NIP)</Label>
        <Input value={f.nip || ""} onChange={(e) => update("nip", e.target.value)} placeholder="Masukkan NIP jika ada..." />
      </div>
      
      {/* Kolom Bio diubah menjadi Sambutan/Profil */}
      <div className="col-span-2">
        <Label>Sambutan Kelurahan / Bio Profil</Label>
        <Textarea value={f.bio || ""} onChange={(e) => update("bio", e.target.value)} rows={3} placeholder="Tuliskan kata sambutan atau profil singkat..." />
      </div>
      
      <div className="col-span-2"><Label>Foto URL</Label><Uploader value={f.photo_url} onChange={(v) => update("photo_url", v)} label="Foto Pengurus" /></div>
      
      <div className="col-span-2 flex justify-end mt-2">
        <Button onClick={() => onSubmit(f)} className="brand-blue hover:brightness-90">Simpan Penempatan</Button>
      </div>
    </div>
  );
}

function AdminOrgNode({ p, onEdit, onDelete }) {
  return (
    <div className="relative flex flex-col items-center text-center p-3 rounded-xl bg-card border-2 shadow-sm w-[170px] group transition-all hover:border-brand-blue">
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex bg-background/95 rounded-md shadow-sm border p-0.5 z-10">
        <Button size="icon" variant="ghost" className="h-6 w-6 text-brand-blue" onClick={() => onEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
        <Button size="icon" variant="ghost" className="h-6 w-6 text-brand-red" onClick={() => onDelete(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>
      <Avatar className="h-12 w-12 border-2 border-secondary/40 mb-2 bg-muted">
        <AvatarImage src={p.photo_url} />
        <AvatarFallback className="brand-green font-display text-sm">{p.name ? p.name.charAt(0) : "P"}</AvatarFallback>
      </Avatar>
      <div className="text-[9px] uppercase tracking-widest text-brand-green font-bold leading-tight min-h-[24px] flex items-center justify-center">{p.position}</div>
      <div className="font-display font-semibold text-xs leading-tight mt-1 truncate w-full">{p.name}</div>
    </div>
  );
}

function EmptyOrgNode({ label, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center text-center p-3 rounded-xl border-2 border-dashed border-border bg-muted/20 hover:bg-muted/50 hover:border-brand-blue/50 w-[170px] h-[120px] transition-all group">
      <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
        <Plus className="h-4 w-4 text-brand-blue" />
      </div>
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">{label}</div>
    </button>
  );
}

function PendidikanForm({ initial, onSubmit }) {
  const [f, setF] = useState(initial || EMPTY_PENDIDIKAN);
  const update = (k, v) => setF({ ...f, [k]: v });
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2"><Label>Nama Institusi/Sekolah</Label><Input value={f.nama_sekolah} onChange={(e) => update("nama_sekolah", e.target.value)} /></div>
      <div className="col-span-2">
        <Label>Jenis Sekolah</Label>
        <Select value={f.jenis_sekolah} onValueChange={(v) => update("jenis_sekolah", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PAUD">PAUD</SelectItem><SelectItem value="TK">TK</SelectItem><SelectItem value="SD">SD</SelectItem><SelectItem value="SMP">SMP</SelectItem><SelectItem value="SMA/SMK">SMA/SMK</SelectItem></SelectContent></Select>
      </div>
      <div className="col-span-2"><Label>Lokasi / Alamat</Label><Textarea value={f.lokasi} onChange={(e) => update("lokasi", e.target.value)} /></div>
      <div className="col-span-2 flex justify-end"><Button onClick={() => onSubmit(f)} className="brand-blue hover:brightness-90">Simpan</Button></div>
    </div>
  );
}

function UmkmForm({ initial, onSubmit }) {
  const [f, setF] = useState(initial || EMPTY_UMKM);
  const update = (k, v) => setF({ ...f, [k]: v });
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2"><Label>Nama UMKM</Label><Input value={f.nama_umkm} onChange={(e) => update("nama_umkm", e.target.value)} /></div>
      <div><Label>Nama Pemilik</Label><Input value={f.nama_pemilik} onChange={(e) => update("nama_pemilik", e.target.value)} /></div>
      <div><Label>No HP</Label><Input value={f.no_hp} onChange={(e) => update("no_hp", e.target.value)} /></div>
      <div className="col-span-2"><Label>Alamat Lengkap</Label><Textarea value={f.alamat} onChange={(e) => update("alamat", e.target.value)} /></div>
      <div>
        <Label>Sertifikat</Label>
        <Select value={f.sertifikat ? "true" : "false"} onValueChange={(v) => update("sertifikat", v === "true")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="true">ADA</SelectItem><SelectItem value="false">TIDAK ADA</SelectItem></SelectContent></Select>
      </div>
      <div>
        <Label>Status NIB</Label>
        <Select value={f.nib_status ? "true" : "false"} onValueChange={(v) => update("nib_status", v === "true")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="true">ADA</SelectItem><SelectItem value="false">TIDAK ADA</SelectItem></SelectContent></Select>
      </div>
      <div className="col-span-2"><Label>Nomor NIB (opsional)</Label><Input value={f.nib_nomor || ""} onChange={(e) => update("nib_nomor", e.target.value)} placeholder="Cth: 1234567890123" /></div>
      <div><Label>Jumlah Omset</Label><Input value={f.omset_jumlah || ""} onChange={(e) => update("omset_jumlah", e.target.value)} placeholder="Cth: Rp 10.000.000" /></div>
      <div>
        <Label>Periode Omset</Label>
        <Select value={f.omset_periode} onValueChange={(v) => update("omset_periode", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Bulanan">Bulanan</SelectItem><SelectItem value="Tahunan">Tahunan</SelectItem></SelectContent></Select>
      </div>
      <div className="col-span-2 flex justify-end"><Button onClick={() => onSubmit(f)} className="brand-blue hover:brightness-90">Simpan</Button></div>
    </div>
  );
}

export default function AdminPanel() {
  const [contacts, setContacts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [agenda, setAgenda] = useState([]);
  const [pengurus, setPengurus] = useState([]);
  const [pendidikan, setPendidikan] = useState([]); 
  const [umkm, setUmkm] = useState([]); 
  const [info, setInfo] = useState(null);
  
  const [editingContact, setEditingContact] = useState(null);
  const [editingPengurus, setEditingPengurus] = useState(null);
  const [prefilledRole, setPrefilledRole] = useState(""); 
  const [editingPendidikan, setEditingPendidikan] = useState(null); 
  const [editingUmkm, setEditingUmkm] = useState(null); 
  
  const [openContact, setOpenContact] = useState(false);
  const [openPengurus, setOpenPengurus] = useState(false);
  const [openPendidikan, setOpenPendidikan] = useState(false); 
  const [openUmkm, setOpenUmkm] = useState(false); 
  const [openAnn, setOpenAnn] = useState(false);
  const [openAg, setOpenAg] = useState(false);
  
  const [annForm, setAnnForm] = useState({ title: "", body: "", priority: "normal" });
  const [agForm, setAgForm] = useState({ title: "", date: "", time: "", location: "", description: "" });
  const [previewMode, setPreviewMode] = useState("desktop");
  const previewWidths = { desktop: "100%", tablet: "768px", mobile: "390px" };
  const [hasDraft, setHasDraft] = useState(false);
  const [publishLog, setPublishLog] = useState([]);

  const load = async () => {
    try {
      const [cRes, aRes, gRes, pRes, iRes, logRes, pendRes, umkmRes] = await Promise.all([
        supabase.from("contacts").select("*").order("id", { ascending: false }),
        supabase.from("announcements").select("*").order("id", { ascending: false }),
        supabase.from("agenda").select("*").order("id", { ascending: false }),
        supabase.from("pengurus").select("*").order("order", { ascending: true }),
        supabase.from("info").select("*").eq("id", 1).maybeSingle(),
        supabase.from("publish_log").select("*").order("published_at", { ascending: false }),
        supabase.from("pendidikan").select("*").order("nama_sekolah", { ascending: true }), 
        supabase.from("umkm").select("*").order("nama_umkm", { ascending: true }), 
      ]);

      if (cRes.data) setContacts(cRes.data);
      if (aRes.data) setAnnouncements(aRes.data);
      if (gRes.data) setAgenda(gRes.data);
      if (pRes.data) setPengurus(pRes.data);
      if (iRes.data) { setInfo(iRes.data); setHasDraft(iRes.data.has_draft); }
      if (logRes.data) setPublishLog(logRes.data);
      if (pendRes.data) setPendidikan(pendRes.data); 
      if (umkmRes.data) setUmkm(umkmRes.data); 
    } catch (err) { toast.error("Gagal memuat data dari database"); }
  };
  useEffect(() => { load(); }, []);

  const pLurah = pengurus.find(p => p.order === 1);
  const pSekdes = pengurus.find(p => p.order === 2);
  const pKasiPem = pengurus.find(p => p.order === 10);
  const pPranata = pengurus.find(p => p.order === 11);
  const pPenata = pengurus.find(p => p.order === 12);
  const pOpPem = pengurus.find(p => p.order === 13);
  const pKasiDay = pengurus.find(p => p.order === 20);
  const pOpDay = pengurus.find(p => p.order === 21);
  const pKasiTib = pengurus.find(p => p.order === 30);
  const pOpTib = pengurus.find(p => p.order === 31);

  const handleAddSlot = (roleId) => {
    setEditingPengurus(null);
    setPrefilledRole(roleId);
    setOpenPengurus(true);
  };

  const handleEditSlot = (p) => {
    setEditingPengurus(p);
    setPrefilledRole(""); 
    setOpenPengurus(true);
  };

  const savePengurus = async (payload) => {
    try {
      if (editingPengurus) {
        const { error } = await supabase.from("pengurus").update(payload).eq("id", editingPengurus.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("pengurus").insert([payload]);
        if (error) throw error;
      }
      toast.success("Pengurus tersimpan ke dalam bagan");
      setOpenPengurus(false); setEditingPengurus(null); load();
    } catch (e) { toast.error(e.message || "Gagal menyimpan data pengurus"); }
  };
  const delPengurus = async (id) => {
    if (!window.confirm("Keluarkan pengurus ini dari bagan?")) return;
    try {
      const { error } = await supabase.from("pengurus").delete().eq("id", id);
      if (error) throw error;
      toast.success("Terhapus"); load();
    } catch (e) { toast.error(e.message || "Gagal menghapus"); }
  };

  const saveContact = async (payload) => { 
    try {
      if (editingContact) { await supabase.from("contacts").update(payload).eq("id", editingContact.id); } 
      else { await supabase.from("contacts").insert([payload]); }
      toast.success("Kontak tersimpan"); setOpenContact(false); setEditingContact(null); load();
    } catch (e) { toast.error("Gagal"); }
  };
  const delContact = async (id) => {
    if (!window.confirm("Hapus?")) return;
    try { await supabase.from("contacts").delete().eq("id", id); toast.success("Terhapus"); load(); } catch (e) { toast.error("Gagal"); }
  };

  const saveInfo = async () => {
    try {
      const { error } = await supabase.from("info").update({ ...info, has_draft: true, is_draft: true }).eq("id", 1);
      if (error) throw error; toast.success("Draft tersimpan."); load();
    } catch (e) { toast.error("Gagal menyimpan draft"); }
  };
  const publishInfo = async () => {
    if (!window.confirm("Publish perubahan?")) return;
    try {
      const { data: userData } = await supabase.auth.getUser();
      await supabase.from("info").update({ has_draft: false, is_draft: false }).eq("id", 1);
      await supabase.from("publish_log").insert([{ user_email: userData?.user?.email || "admin@kelurahan.id", changed_fields: ["STATISTIK", "PROFIL"] }]);
      toast.success("Dipublikasikan"); const f = document.getElementById("landing-preview-frame"); if (f) f.src = `/?t=${Date.now()}`; load();
    } catch (e) { toast.error("Gagal publish"); }
  };
  const discardDraft = async () => {
    if (!window.confirm("Batalkan draft?")) return;
    try { await supabase.from("info").update({ has_draft: false, is_draft: false }).eq("id", 1); toast.success("Dibatalkan"); load(); } catch (e) { toast.error("Gagal"); }
  };
  const addAnn = async () => {
    try { await supabase.from("announcements").insert([annForm]); toast.success("Ditambahkan"); setAnnForm({ title: "", body: "", priority: "normal" }); setOpenAnn(false); load(); } catch (e) { toast.error("Gagal"); }
  };
  const delAnn = async (id) => { if (!window.confirm("Hapus?")) return; try { await supabase.from("announcements").delete().eq("id", id); load(); } catch (e) { toast.error("Gagal"); } };
  const addAg = async () => {
    try { await supabase.from("agenda").insert([agForm]); toast.success("Ditambahkan"); setAgForm({ title: "", date: "", time: "", location: "", description: "" }); setOpenAg(false); load(); } catch (e) { toast.error("Gagal"); }
  };
  const delAg = async (id) => { if (!window.confirm("Hapus?")) return; try { await supabase.from("agenda").delete().eq("id", id); load(); } catch (e) { toast.error("Gagal"); } };

  const savePendidikan = async (payload) => {
    try {
      if (editingPendidikan) await supabase.from("pendidikan").update(payload).eq("id", editingPendidikan.id);
      else await supabase.from("pendidikan").insert([payload]);
      toast.success("Tersimpan"); setOpenPendidikan(false); setEditingPendidikan(null); load();
    } catch (e) { toast.error("Gagal"); }
  };
  const delPendidikan = async (id) => { if (!window.confirm("Hapus?")) return; try { await supabase.from("pendidikan").delete().eq("id", id); toast.success("Terhapus"); load(); } catch (e) { toast.error("Gagal"); } };
  
  const saveUmkm = async (payload) => {
    try {
      if (editingUmkm) await supabase.from("umkm").update(payload).eq("id", editingUmkm.id);
      else await supabase.from("umkm").insert([payload]);
      toast.success("Tersimpan"); setOpenUmkm(false); setEditingUmkm(null); load();
    } catch (e) { toast.error("Gagal"); }
  };
  const delUmkm = async (id) => { if (!window.confirm("Hapus?")) return; try { await supabase.from("umkm").delete().eq("id", id); toast.success("Terhapus"); load(); } catch (e) { toast.error("Gagal"); } };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl brand-blue flex items-center justify-center"><Shield className="h-6 w-6" /></div>
        <div>
          <h1 className="font-display font-bold text-3xl">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Kelola konten portal warga</p>
        </div>
      </div>

      <Tabs defaultValue="info">
        <TabsList className="overflow-x-auto flex-nowrap w-full justify-start whitespace-nowrap scrollbar-hide">
          <TabsTrigger value="info">Info & Statistik</TabsTrigger>
          <TabsTrigger value="pengurus">Pengurus ({pengurus.length})</TabsTrigger>
          <TabsTrigger value="contacts">Kontak ({contacts.length})</TabsTrigger>
          <TabsTrigger value="pendidikan">Pendidikan ({pendidikan.length})</TabsTrigger>
          <TabsTrigger value="umkm">UMKM ({umkm.length})</TabsTrigger>
          <TabsTrigger value="announcements">Pengumuman ({announcements.length})</TabsTrigger>
          <TabsTrigger value="agenda">Agenda ({agenda.length})</TabsTrigger>
          <TabsTrigger value="preview">Preview Landing</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          {info && (
            <Card><CardContent className="p-6 space-y-4">
              <h3 className="font-display font-semibold text-lg">Statistik Kelurahan</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div><Label>Total KK</Label><Input type="number" value={info.total_kk || 0} onChange={(e) => setInfo({ ...info, total_kk: parseInt(e.target.value || "0") })} /></div>
                <div><Label>Total Penduduk</Label><Input type="number" value={info.total_penduduk || 0} onChange={(e) => setInfo({ ...info, total_penduduk: parseInt(e.target.value || "0") })} /></div>
                <div><Label>Total RT</Label><Input type="number" value={info.total_rt || 0} onChange={(e) => setInfo({ ...info, total_rt: parseInt(e.target.value || "0") })} /></div>
                <div><Label>Total RW</Label><Input type="number" value={info.total_rw || 0} onChange={(e) => setInfo({ ...info, total_rw: parseInt(e.target.value || "0") })} /></div>
                <div><Label>Total Kader</Label><Input type="number" value={info.total_kader || 0} onChange={(e) => setInfo({ ...info, total_kader: parseInt(e.target.value || "0") })} /></div>
              </div>
              <h3 className="font-display font-semibold text-lg pt-4">Profil Kelurahan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><Label>Nama Kelurahan</Label><Input value={info.name || ""} onChange={(e) => setInfo({ ...info, name: e.target.value })} /></div>
                <div><Label>Wilayah (Kecamatan/Kota)</Label><Input value={info.wilayah || ""} onChange={(e) => setInfo({ ...info, wilayah: e.target.value })} /></div>
                <div className="md:col-span-2"><Label>Alamat</Label><Input value={info.address || ""} onChange={(e) => setInfo({ ...info, address: e.target.value })} /></div>
                <div className="md:col-span-2"><Label>Jam Operasional</Label><Input value={info.office_hours || ""} onChange={(e) => setInfo({ ...info, office_hours: e.target.value })} /></div>
              </div>
              <h3 className="font-display font-semibold text-lg pt-4">Tampilan Landing Page</h3>
              <div className="space-y-3">
                <div><Label>Foto Background Landing</Label><Uploader value={info.hero_bg_url || ""} onChange={(v) => setInfo({ ...info, hero_bg_url: v })} label="Background Hero" /></div>
                <div><Label>Tagline Hero</Label><Textarea value={info.hero_tagline || ""} onChange={(e) => setInfo({ ...info, hero_tagline: e.target.value })} rows={2} /></div>
              </div>
              <div className="flex justify-between items-center pt-2 gap-2 flex-wrap">
                <div className="text-xs">
                  {hasDraft ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full brand-orange text-xs font-semibold"><AlertCircle className="h-3 w-3" /> Ada perubahan draft belum dipublikasikan</span> : <span className="text-muted-foreground">Semua perubahan sudah tayang.</span>}
                </div>
                <div className="flex gap-2">
                  {hasDraft && <Button variant="outline" onClick={discardDraft} className="gap-1"><RotateCcw className="h-4 w-4" /> Batalkan Draft</Button>}
                  <Button onClick={saveInfo} variant="outline">Simpan Draft</Button>
                  <Button onClick={publishInfo} disabled={!hasDraft} className="brand-green hover:brightness-90 gap-1"><Send className="h-4 w-4" /> Publish</Button>
                </div>
              </div>
            </CardContent></Card>
          )}
          <Card className="mt-4"><CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4"><History className="h-5 w-5 text-brand-blue" /><h3 className="font-display font-semibold">Riwayat Publish ({publishLog.length})</h3></div>
            {publishLog.length === 0 ? (<div className="text-sm text-muted-foreground text-center py-6">Belum ada riwayat publish.</div>) : (
              <div className="space-y-3">
                {publishLog.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                    <div className="w-9 h-9 rounded-full brand-blue flex items-center justify-center shrink-0"><User className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="font-semibold text-sm">{entry.user_email}</div>
                        <div className="text-xs text-muted-foreground tabular-nums">{new Date(entry.published_at).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                      </div>
                      {entry.changed_fields?.length > 0 ? (<div className="flex flex-wrap gap-1 mt-2">{entry.changed_fields.map((f) => (<span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-mono font-semibold uppercase">{f}</span>))}</div>) : (<div className="text-xs text-muted-foreground mt-1">Tidak ada perubahan</div>)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="pengurus" className="space-y-4 mt-4">
          <div className="flex justify-between items-center bg-brand-blue/5 p-4 rounded-xl border border-brand-blue/20">
            <div className="max-w-2xl">
              <h3 className="font-semibold text-brand-blue flex items-center gap-2 mb-1">Editor Hierarki Visual <AlertCircle className="h-4 w-4" /></h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Klik tombol <strong>(+)</strong> di kotak yang kosong untuk menambahkan pengurus ke posisi tersebut. Klik ikon pensil untuk mengubah data orang yang bersangkutan. Susunan ini langsung terhubung dengan Landing Page.</p>
            </div>
            <Dialog open={openPengurus} onOpenChange={(v) => { setOpenPengurus(v); if (!v) setEditingPengurus(null); }}>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{editingPengurus ? "Edit" : "Tambah"} Pengurus</DialogTitle></DialogHeader>
                <PengurusForm key={editingPengurus?.id || prefilledRole || "new"} initial={editingPengurus} prefilledRole={prefilledRole} onSubmit={savePengurus} />
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="bg-muted/10 py-10 rounded-xl border overflow-x-auto">
            <div className="min-w-[800px] flex flex-col items-center gap-0">
              <div className="flex flex-col items-center">
                 {pLurah ? <AdminOrgNode p={pLurah} onEdit={handleEditSlot} onDelete={delPengurus} /> : <EmptyOrgNode label="Tambah Lurah" onClick={() => handleAddSlot("Lurah")} />}
              </div>
              <div className="flex flex-col items-center">
                 <div className="w-px h-8 bg-border" />
                 {pSekdes ? <AdminOrgNode p={pSekdes} onEdit={handleEditSlot} onDelete={delPengurus} /> : <EmptyOrgNode label="Tambah Sekretaris" onClick={() => handleAddSlot("Sekdes")} />}
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="relative w-full max-w-[700px] flex justify-center">
                 <div className="absolute top-0 h-px bg-border w-full" />
              </div>
              <div className="grid grid-cols-3 gap-6 w-full max-w-[900px] pt-8 relative">
                 <div className="flex flex-col items-center relative">
                    <div className="absolute -top-8 w-px h-8 bg-border" />
                    {pKasiPem ? <AdminOrgNode p={pKasiPem} onEdit={handleEditSlot} onDelete={delPengurus} /> : <EmptyOrgNode label="Tambah Kasi Pem." onClick={() => handleAddSlot("Kasi Pem")} />}
                    <div className="w-px h-6 bg-border" />
                    {pPranata ? <AdminOrgNode p={pPranata} onEdit={handleEditSlot} onDelete={delPengurus} /> : <EmptyOrgNode label="Tambah Pranata" onClick={() => handleAddSlot("Pranata")} />}
                    <div className="w-px h-6 bg-border" />
                    {pPenata ? <AdminOrgNode p={pPenata} onEdit={handleEditSlot} onDelete={delPengurus} /> : <EmptyOrgNode label="Tambah Penata" onClick={() => handleAddSlot("Penata")} />}
                    <div className="w-px h-6 bg-border" />
                    {pOpPem ? <AdminOrgNode p={pOpPem} onEdit={handleEditSlot} onDelete={delPengurus} /> : <EmptyOrgNode label="Tambah Operator" onClick={() => handleAddSlot("Op Pem")} />}
                 </div>
                 <div className="flex flex-col items-center relative">
                    <div className="absolute -top-8 w-px h-8 bg-border" />
                    {pKasiDay ? <AdminOrgNode p={pKasiDay} onEdit={handleEditSlot} onDelete={delPengurus} /> : <EmptyOrgNode label="Tambah Kasi Pemb." onClick={() => handleAddSlot("Kasi Day")} />}
                    <div className="w-px h-6 bg-border" />
                    {pOpDay ? <AdminOrgNode p={pOpDay} onEdit={handleEditSlot} onDelete={delPengurus} /> : <EmptyOrgNode label="Tambah Operator" onClick={() => handleAddSlot("Op Day")} />}
                 </div>
                 <div className="flex flex-col items-center relative">
                    <div className="absolute -top-8 w-px h-8 bg-border" />
                    {pKasiTib ? <AdminOrgNode p={pKasiTib} onEdit={handleEditSlot} onDelete={delPengurus} /> : <EmptyOrgNode label="Tambah Kasi Kemanan" onClick={() => handleAddSlot("Kasi Tib")} />}
                    <div className="w-px h-6 bg-border" />
                    {pOpTib ? <AdminOrgNode p={pOpTib} onEdit={handleEditSlot} onDelete={delPengurus} /> : <EmptyOrgNode label="Tambah Operator" onClick={() => handleAddSlot("Op Tib")} />}
                 </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Dialog open={openContact} onOpenChange={(v) => { setOpenContact(v); if (!v) setEditingContact(null); }}>
              <DialogTrigger asChild><Button className="brand-blue hover:brightness-90 gap-1"><Plus className="h-4 w-4" /> Kontak Baru</Button></DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>{editingContact ? "Edit" : "Tambah"} Kontak</DialogTitle></DialogHeader><ContactForm key={editingContact?.id || "new"} initial={editingContact} onSubmit={saveContact} /></DialogContent>
            </Dialog>
          </div>
          <Card><CardContent className="p-0 divide-y">
            {contacts.map((c) => (
              <div key={c.id} className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0"><div className="font-semibold truncate">{c.name} <span className="text-xs text-muted-foreground">· {c.category}/{c.subcategory}</span></div><div className="text-xs text-muted-foreground">{c.role} · {c.phone}</div></div>
                <div className="flex gap-1"><Button size="icon" variant="ghost" onClick={() => { setEditingContact(c); setOpenContact(true); }}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => delContact(c.id)}><Trash2 className="h-4 w-4 text-brand-red" /></Button></div>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="pendidikan" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Dialog open={openPendidikan} onOpenChange={(v) => { setOpenPendidikan(v); if (!v) setEditingPendidikan(null); }}>
              <DialogTrigger asChild><Button className="brand-blue hover:brightness-90 gap-1"><Plus className="h-4 w-4" /> Data Pendidikan Baru</Button></DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>{editingPendidikan ? "Edit" : "Tambah"} Pendidikan</DialogTitle></DialogHeader><PendidikanForm key={editingPendidikan?.id || "new"} initial={editingPendidikan} onSubmit={savePendidikan} /></DialogContent>
            </Dialog>
          </div>
          <Card><CardContent className="p-0 divide-y">
            {pendidikan.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0"><div className="font-semibold truncate">{p.nama_sekolah} <span className="text-xs font-bold text-brand-blue">· {p.jenis_sekolah}</span></div><div className="text-xs text-muted-foreground line-clamp-1">{p.lokasi}</div></div>
                <div className="flex gap-1"><Button size="icon" variant="ghost" onClick={() => { setEditingPendidikan(p); setOpenPendidikan(true); }}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => delPendidikan(p.id)}><Trash2 className="h-4 w-4 text-brand-red" /></Button></div>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="umkm" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Dialog open={openUmkm} onOpenChange={(v) => { setOpenUmkm(v); if (!v) setEditingUmkm(null); }}>
              <DialogTrigger asChild><Button className="bg-orange-500 hover:bg-orange-600 text-white gap-1"><Plus className="h-4 w-4" /> UMKM Baru</Button></DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>{editingUmkm ? "Edit" : "Tambah"} UMKM</DialogTitle></DialogHeader><UmkmForm key={editingUmkm?.id || "new"} initial={editingUmkm} onSubmit={saveUmkm} /></DialogContent>
            </Dialog>
          </div>
          <Card><CardContent className="p-0 divide-y">
            {umkm.map((u) => (
              <div key={u.id} className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0"><div className="font-semibold truncate">{u.nama_umkm} <span className="text-xs text-muted-foreground font-normal">({u.nama_pemilik})</span></div><div className="text-xs text-muted-foreground line-clamp-1">{u.alamat} · {u.no_hp}</div></div>
                <div className="flex gap-1"><Button size="icon" variant="ghost" onClick={() => { setEditingUmkm(u); setOpenUmkm(true); }}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => delUmkm(u.id)}><Trash2 className="h-4 w-4 text-brand-red" /></Button></div>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Dialog open={openAnn} onOpenChange={setOpenAnn}>
              <DialogTrigger asChild><Button className="brand-blue hover:brightness-90 gap-1"><Plus className="h-4 w-4" /> Pengumuman Baru</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Tambah Pengumuman</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Judul</Label><Input value={annForm.title} onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })} /></div>
                  <div><Label>Isi</Label><Textarea value={annForm.body} onChange={(e) => setAnnForm({ ...annForm, body: e.target.value })} /></div>
                  <div><Label>Prioritas</Label><Select value={annForm.priority} onValueChange={(v) => setAnnForm({ ...annForm, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="normal">Normal</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent></Select></div>
                </div>
                <DialogFooter><Button onClick={addAnn} className="brand-blue hover:brightness-90">Simpan</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <Card><CardContent className="p-0 divide-y">
            {announcements.map((a) => (
              <div key={a.id} className="p-4 flex items-start justify-between gap-4">
                <div className="min-w-0"><div className="font-semibold">{a.title} {a.priority === "urgent" && <span className="text-xs text-brand-red">· URGENT</span>}</div><div className="text-xs text-muted-foreground line-clamp-2">{a.body}</div></div>
                <Button size="icon" variant="ghost" onClick={() => delAnn(a.id)}><Trash2 className="h-4 w-4 text-brand-red" /></Button>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="agenda" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Dialog open={openAg} onOpenChange={setOpenAg}>
              <DialogTrigger asChild><Button className="brand-blue hover:brightness-90 gap-1"><Plus className="h-4 w-4" /> Agenda Baru</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Tambah Agenda</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><Label>Judul</Label><Input value={agForm.title} onChange={(e) => setAgForm({ ...agForm, title: e.target.value })} /></div>
                  <div><Label>Tanggal</Label><Input type="date" value={agForm.date} onChange={(e) => setAgForm({ ...agForm, date: e.target.value })} /></div>
                  <div><Label>Waktu</Label><Input value={agForm.time} onChange={(e) => setAgForm({ ...agForm, time: e.target.value })} placeholder="19.30 WIB" /></div>
                  <div className="col-span-2"><Label>Lokasi</Label><Input value={agForm.location} onChange={(e) => setAgForm({ ...agForm, location: e.target.value })} /></div>
                  <div className="col-span-2"><Label>Deskripsi</Label><Textarea value={agForm.description} onChange={(e) => setAgForm({ ...agForm, description: e.target.value })} /></div>
                </div>
                <DialogFooter><Button onClick={addAg} className="brand-blue hover:brightness-90">Simpan</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <Card><CardContent className="p-0 divide-y">
            {agenda.map((a) => (
              <div key={a.id} className="p-4 flex items-center justify-between gap-4">
                <div><div className="font-semibold">{a.title}</div><div className="text-xs text-muted-foreground">{a.date} · {a.time} · {a.location}</div></div>
                <Button size="icon" variant="ghost" onClick={() => delAg(a.id)}><Trash2 className="h-4 w-4 text-brand-red" /></Button>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4 mt-4">
          <Card><CardContent className="p-4">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
              <div><h3 className="font-display font-semibold">Preview Landing Page (Live)</h3><p className="text-xs text-muted-foreground">Refresh setelah menyimpan perubahan di tab Info.</p></div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border bg-muted p-1">
                  <Button size="sm" variant={previewMode === "desktop" ? "default" : "ghost"} onClick={() => setPreviewMode("desktop")} className="gap-1 h-8"><Monitor className="h-4 w-4" /> Desktop</Button>
                  <Button size="sm" variant={previewMode === "tablet" ? "default" : "ghost"} onClick={() => setPreviewMode("tablet")} className="gap-1 h-8"><Tablet className="h-4 w-4" /> Tablet</Button>
                  <Button size="sm" variant={previewMode === "mobile" ? "default" : "ghost"} onClick={() => setPreviewMode("mobile")} className="gap-1 h-8"><Smartphone className="h-4 w-4" /> Mobile</Button>
                </div>
                <Button variant="outline" size="sm" onClick={() => { const f = document.getElementById("landing-preview-frame"); if (f) f.src = `/?t=${Date.now()}`; }}>Refresh</Button>
                <a href="/" target="_blank" rel="noreferrer"><Button size="sm" className="brand-blue hover:brightness-90 gap-1"><ExternalLink className="h-4 w-4" /> Buka Baru</Button></a>
              </div>
            </div>
            <div className="border rounded-lg overflow-hidden bg-muted/40 flex justify-center transition-all">
              <div style={{ width: previewWidths[previewMode], transition: "width 0.3s ease" }} className="bg-background shadow-md"><iframe id="landing-preview-frame" title="Preview Landing" src="/" className="w-full block" style={{ height: "70vh", border: 0 }} /></div>
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}