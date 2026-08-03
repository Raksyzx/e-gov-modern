import { useRef, useState } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

// Helper untuk memastikan format URL gambar valid
export function toAbsoluteUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  return url;
}

export default function Uploader({ value, onChange, label = "Upload gambar", testid = "uploader" }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFileToSupabase = async (file) => {
    if (!file) return;

    // Validasi format file gambar
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }

    // Validasi ukuran file (Maksimal 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal adalah 5MB");
      return;
    }

    setLoading(true);
    setProgress(20);

    try {
      // Membuat nama file acak yang unik di dalam bucket
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      setProgress(50);

      // Proses upload ke bucket bernama 'uploads'
      const { data, error } = await supabase.storage
        .from("uploads")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      setProgress(90);

      // Mendapatkan URL publik hasil upload
      const { data: publicUrlData } = supabase.storage
        .from("uploads")
        .getPublicUrl(filePath);

      const finalUrl = publicUrlData.publicUrl;
      
      // Pemicu perubahan data ke state form admin
      onChange(finalUrl);
      setProgress(100);
      toast.success("Gambar berhasil diunggah");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.message || "Gagal mengunggah gambar");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) uploadFileToSupabase(f);
  };

  const preview = toAbsoluteUrl(value);

  return (
    <div className="space-y-2" data-testid={testid}>
      <div className="text-sm font-medium">{label}</div>
      
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !loading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors min-h-[140px] flex flex-col items-center justify-center relative ${
          dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50"
        } ${loading ? "opacity-60 pointer-events-none" : ""}`}
      >
        {preview ? (
          <div className="relative group w-full max-h-[200px] overflow-hidden rounded-md" onClick={(e) => e.stopPropagation()}>
            <img src={preview} alt="Preview" className="w-full h-full object-cover max-h-[200px]" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-2 right-2 p-1.5 bg-background/80 hover:bg-background rounded-full text-destructive shadow-sm"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <div>Mengunggah... ({progress}%)</div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground py-2">
            <Upload className="h-6 w-6" />
            <div>
              <span className="font-semibold text-foreground">Klik untuk pilih</span> atau seret file di sini
            </div>
            <div className="text-xs text-muted-foreground/70">Otomatis masuk ke Supabase Storage (Maks ~5MB)</div>
          </div>
        )}
        
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => uploadFileToSupabase(e.target.files?.[0])}
          data-testid={`${testid}-input`}
          disabled={loading}
        />
      </div>
    </div>
  );
}