import { useEffect, useState } from "react";
import { MapPin, Clock, Building2, Phone, Target, ListChecks, Landmark } from "lucide-react";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import fotoKelurahan from './fotokelurahan.jpeg';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function ProfilKelurahan() {
  const [info, setInfo] = useState(null);
  
  useEffect(() => { 
    api.get("/info").then((r) => setInfo(r.data)); 
  }, []);

  // Data GeoJSON dengan titik koordinat yang disesuaikan meliuk mengikuti bentuk peta fisik SukaMaju
  const SukaMajuBoundary = {
    "type": "Feature",
    "properties": {
      "name": "Kelurahan SukaMaju"
    },
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [106.1460, -6.0950], // Ujung utara (puncak meliuk)
          [106.1490, -6.0965], 
          [106.1520, -6.0990], // Lekukan sisi timur laut
          [106.1540, -6.1020],
          [106.1510, -6.1050],
          [106.1550, -6.1080], // Tonjolan sisi timur
          [106.1580, -6.1120],
          [106.1520, -6.1160],
          [106.1480, -6.1190], // Sisi tenggara
          [106.1420, -6.1220], // Ujung selatan (bagian bawah peta)
          [106.1360, -6.1200],
          [106.1320, -6.1170], // Lekukan sisi barat daya
          [106.1300, -6.1140],
          [106.1340, -6.1100], // Lekukan menjorok ke dalam di sisi barat
          [106.1380, -6.1070],
          [106.1350, -6.1030], // Sisi barat laut
          [106.1400, -6.0990],
          [106.1430, -6.0960],
          [106.1460, -6.0950]  // Titik akhir ditutup kembali ke titik awal
        ]
      ]
    }
  };

  // Styling untuk warna area ungu wilayah
  const boundaryStyle = {
    color: '#7c3aed',      // Garis tepi ungu
    weight: 3,
    fillColor: '#8b5cf6',  // Isi ungu transparan
    fillOpacity: 0.4
  };

  return (
    <div className="space-y-12 pb-12" data-testid="profil-page">
      
      {/* HEADER HALAMAN */}
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-blue mb-2">
          <Landmark className="h-4 w-4" /> Profil & Informasi
        </div>
        <h1 className="font-display font-bold text-3xl md:text-4xl">Profil Kelurahan</h1>
        <p className="text-muted-foreground mt-1">Sejarah, visi misi, dan lokasi pelayanan warga.</p>
      </div>

      {/* SEKSI 1: VISI & MISI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-t-4 border-t-brand-blue shadow-sm">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-brand-blue/10 rounded-xl text-brand-blue">
                <Target className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold font-display">Visi</h2>
            </div>
            <p className="text-muted-foreground text-lg italic leading-relaxed">
              "Menjadikan Kota SukaMaju yang Maju Kotanya, Bahagia dan Sejahtera Warganya".
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-brand-green shadow-sm">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-brand-green/10 rounded-xl text-brand-green">
                <ListChecks className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold font-display">Misi</h2>
            </div>
            <ul className="space-y-3 text-muted-foreground list-disc list-inside">
              <li>Mewujudkan Ketahanan Keluarga Sebagai Pondasi Pembangunan.</li>
              <li>Mewujudkan Manusia yang Sehat, Cerdas dan Memiliki Kesalehan Sosial.</li>
              <li>Membangun dan Meningkatkan Sarana dan Prasarana Pelayanan Dasar yang Berkualitas.</li>
              <li>Mengentaskan Kemiskinan dengan Mengedepankan Kreatifitas Berusaha, Menciptakan Lapangan Kerja dan Meningkatkan Kualitas Bekerja.</li>
              <li>Memastikan Pelayanan Publik yang Mudah, Murah dan Cepat</li>
              <li>Mewujudkan Tata Kelola Pemerintahan yang Akuntabel, Profesional dan Bebas Korupsi.</li>
              <li>Mewujudkan Tata Kota Modern yang Rapi, Terang, Terintegrasi dan Bebas Sampah sebagai Kawasan Perdagangan dan Jasa.</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* SEKSI 2: SEJARAH KELURAHAN (Teks Kiri, Foto Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center bg-muted/30 p-6 md:p-10 rounded-3xl border">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold font-display tracking-tight">Sejarah Kelurahan</h2>
          <div className="w-16 h-1.5 brand-blue rounded-full"></div>
          <p className="text-muted-foreground leading-relaxed pt-2">
            Kelurahan SukaMaju memiliki sejarah panjang sebagai salah satu pusat permukiman yang berkembang pesat di Kota Serang. Nama "SukaMaju" sendiri diambil dari nilai-nilai kearifan lokal yang mengedepankan kebersamaan dan kegotongroyongan antar warga.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Seiring berjalannya waktu, kelurahan ini terus bertransformasi menjadi wilayah yang modern dengan tetap mempertahankan nilai-nilai budaya Banten yang kental, serta menjadi pusat penggerak ekonomi kerakyatan di wilayah kecamatan.
          </p>
        </div>
        <div className="relative rounded-2xl overflow-hidden shadow-lg border-4 border-background">
          <img 
            src={fotoKelurahan} 
            alt="Foto Kelurahan" 
            className="w-full h-auto object-cover aspect-[4/3] hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>

      {/* SEKSI 3: PETA INTERAKTIF WILAYAH (MENGGUNAKAN GEOJSON) */}
      <div className="pt-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold font-display">Peta Wilayah Interaktif</h2>
          <p className="text-muted-foreground mt-1">Batas administratif resmi Kelurahan SukaMaju.</p>
        </div>
        
        <Card className="overflow-hidden border shadow-sm">
          <CardContent className="p-0">
            <div className="w-full h-[450px] relative z-0">
              <MapContainer 
                center={[-6.1038, 106.1483]} 
                zoom={15} 
                scrollWheelZoom={false}
                style={{ width: '100%', height: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <GeoJSON 
                  data={SukaMajuBoundary} 
                  style={boundaryStyle} 
                  onEachFeature={(feature, layer) => {
                    layer.bindPopup(`
                      <div style="font-weight: 600; font-size: 14px;">Kelurahan SukaMaju</div>
                      <div style="font-size: 12px; color: #666;">Kecamatan Serang, Kota Serang</div>
                    `);
                  }}
                />
              </MapContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEKSI 4: LOKASI & LAYANAN (Peta Gmaps & Statistik Bawah) */}
      <div className="pt-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold font-display">Lokasi & Layanan</h2>
          <p className="text-muted-foreground mt-1">Alamat lengkap dan jam operasional kantor kelurahan.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl overflow-hidden border shadow-sm" data-testid="map-container">
            <iframe
              title="Lokasi Kantor Kelurahan"
              src="https://www.google.com/maps?q=Kantor+Kelurahan+SukaMaju&output=embed"
              width="100%"
              height="480"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="space-y-4">
            <Card data-testid="office-info" className="shadow-sm">
              <CardContent className="p-6 space-y-5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-blue mb-1.5">
                    <Building2 className="h-4 w-4" /> Alamat
                  </div>
                  <div className="font-medium leading-snug">{info?.address || "Jl. Jiwantaka I, Lingkungan Pekarungan, Kelurahan SukaMaju, Kecamatan Serang, Kota Serang, Banten."}</div>
                  <div className="text-sm text-muted-foreground mt-1">{info?.wilayah || "Kecamatan Serang"}</div>
                </div>
                
                <div className="h-px bg-border w-full"></div>
                
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-green mb-1.5">
                    <Clock className="h-4 w-4" /> Jam Operasional
                  </div>
                  <div className="text-sm font-medium">{info?.office_hours || "08.00 - 17.00 WIB"}</div>
                </div>
                
                <div className="h-px bg-border w-full"></div>
                
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-orange mb-1.5">
                    <Phone className="h-4 w-4" /> Kontak
                  </div>
                  <a href="tel:0254206540" className="text-sm font-medium text-brand-blue hover:underline">0212345678</a>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-orange mb-1.5">
                    <Phone className="h-4 w-4" /> Email
                  </div>
                  <a href="mailto:kel.SukaMaju@gmail.com" className="text-sm font-medium text-brand-blue hover:underline">kel.SukaMaju@gmail.com</a>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">Statistik Wilayah</div>
                <div className="grid grid-cols-2 gap-y-5 gap-x-3 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Total RT</div>
                    <div className="font-display font-bold text-3xl text-foreground">{info?.total_rt || 55}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Total RW</div>
                    <div className="font-display font-bold text-3xl text-foreground">{info?.total_rw || 13}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Kepala Keluarga</div>
                    <div className="font-display font-bold text-2xl text-foreground">{info?.total_kk?.toLocaleString("id-ID") || "230.100"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Penduduk</div>
                    <div className="font-display font-bold text-2xl text-foreground">{info?.total_penduduk?.toLocaleString("id-ID") || "768.377"}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
    </div>
  );
}