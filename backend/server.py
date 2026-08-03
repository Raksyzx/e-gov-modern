from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import uuid
import bcrypt
import jwt
import requests
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, Depends, HTTPException, Request, status, UploadFile, File, Form
from fastapi.responses import Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr


# ---- Config ----
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALG = "HS256"
ADMIN_EMAIL = os.environ['ADMIN_EMAIL']
ADMIN_PASSWORD = os.environ['ADMIN_PASSWORD']

# Object storage config
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "kelurahan-portal"
_storage_key = None


def init_storage():
    global _storage_key
    if _storage_key:
        return _storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120,
    )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

app = FastAPI(title="Kelurahan Dashboard API")
api = APIRouter(prefix="/api")
bearer = HTTPBearer(auto_error=False)


# ---- Helpers ----
def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


async def get_current_admin(creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer)) -> dict:
    if not creds:
        raise HTTPException(status_code=401, detail="Tidak terautentikasi")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALG])
        user = await db.users.find_one({"id": payload["sub"]})
        if not user:
            raise HTTPException(status_code=401, detail="User tidak ditemukan")
        return {"id": user["id"], "email": user["email"], "role": user["role"]}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token kadaluarsa")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token tidak valid")


# ---- Models ----
class LoginReq(BaseModel):
    email: EmailStr
    password: str


class TokenResp(BaseModel):
    access_token: str
    user: dict


class Contact(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: str  # "emergency" | "kader" | "service"
    subcategory: str  # e.g. "rt_rw", "ambulan", "pemadam", "polsek", "puskesmas", "posyandu", "pkk", "linmas"
    name: str
    role: str = ""
    phone: str
    whatsapp: Optional[str] = None
    wilayah: Optional[str] = None  # RT/RW info
    photo_url: Optional[str] = None
    status: str = "available"  # "available" | "busy" | "offline"
    schedule: Optional[str] = None
    notes: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ContactCreate(BaseModel):
    category: str
    subcategory: str
    name: str
    role: str = ""
    phone: str
    whatsapp: Optional[str] = None
    wilayah: Optional[str] = None
    photo_url: Optional[str] = None
    status: str = "available"
    schedule: Optional[str] = None
    notes: Optional[str] = None


class Announcement(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    body: str
    priority: str = "normal"  # "urgent" | "normal"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class AnnouncementCreate(BaseModel):
    title: str
    body: str
    priority: str = "normal"


class Agenda(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    date: str  # ISO date
    time: str = ""
    location: str = ""
    description: str = ""


class AgendaCreate(BaseModel):
    title: str
    date: str
    time: str = ""
    location: str = ""
    description: str = ""


class KelurahanInfo(BaseModel):
    name: str = "Kelurahan Sukamaju"
    total_kk: int = 2547
    total_penduduk: int = 8934
    total_rt: int = 24
    total_rw: int = 6
    total_kader: int = 42
    wilayah: str = "Kec. Sejahtera, Kota Bahagia"
    address: str = "Jl. Merdeka No. 45, Sukamaju"
    map_url: str = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.324!2d106.8272!3d-6.1751!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTAnMzAuNCJTIDEwNsKwNDknMzguMCJF!5e0!3m2!1sen!2sid!4v1234567890"
    office_hours: str = "Senin - Jumat: 08.00 - 16.00 WIB | Sabtu: 08.00 - 12.00 WIB"
    logo_url: str = ""
    hero_bg_url: str = "https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?auto=format&fit=crop&w=1920&q=80"
    hero_tagline: str = "Melayani masyarakat dengan dedikasi, membangun daerah yang maju dan sejahtera bersama-sama"


class Pengurus(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    position: str
    photo_url: str = ""
    phone: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None
    order: int = 0


class PengurusCreate(BaseModel):
    name: str
    position: str
    photo_url: str = ""
    phone: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None
    order: int = 0


# ---- Auth Endpoints ----
@api.post("/auth/login", response_model=TokenResp)
async def login(req: LoginReq):
    email = req.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email atau password salah")
    token = create_token(user["id"], user["email"])
    return {
        "access_token": token,
        "user": {"id": user["id"], "email": user["email"], "role": user["role"], "name": user.get("name", "Admin")},
    }


@api.get("/auth/me")
async def me(current=Depends(get_current_admin)):
    return current


# ---- Kelurahan Info (with draft/publish) ----
@api.get("/info", response_model=KelurahanInfo)
async def get_info():
    doc = await db.kelurahan_info.find_one({"_id": "singleton"})
    if not doc:
        info = KelurahanInfo()
        await db.kelurahan_info.insert_one({"_id": "singleton", **info.model_dump()})
        return info
    doc.pop("_id", None)
    return KelurahanInfo(**doc)


@api.get("/info/draft", response_model=KelurahanInfo)
async def get_info_draft(current=Depends(get_current_admin)):
    doc = await db.kelurahan_info.find_one({"_id": "draft"})
    if not doc:
        # No draft yet — return current published
        return await get_info()
    doc.pop("_id", None)
    return KelurahanInfo(**doc)


@api.get("/info/has-draft")
async def has_draft(current=Depends(get_current_admin)):
    draft = await db.kelurahan_info.find_one({"_id": "draft"})
    published = await db.kelurahan_info.find_one({"_id": "singleton"})
    if not draft:
        return {"has_draft": False}
    if not published:
        return {"has_draft": True}
    d = {k: v for k, v in draft.items() if k != "_id"}
    p = {k: v for k, v in published.items() if k != "_id"}
    return {"has_draft": d != p}


@api.put("/info", response_model=KelurahanInfo)
async def save_info_draft(info: KelurahanInfo, current=Depends(get_current_admin)):
    """Saves to DRAFT — not published until POST /info/publish."""
    await db.kelurahan_info.update_one(
        {"_id": "draft"}, {"$set": info.model_dump()}, upsert=True
    )
    return info


@api.post("/info/publish", response_model=KelurahanInfo)
async def publish_info(current=Depends(get_current_admin)):
    draft = await db.kelurahan_info.find_one({"_id": "draft"})
    if not draft:
        raise HTTPException(status_code=404, detail="Tidak ada draft untuk dipublikasikan")
    draft.pop("_id", None)
    published_before = await db.kelurahan_info.find_one({"_id": "singleton"}) or {}
    await db.kelurahan_info.update_one(
        {"_id": "singleton"}, {"$set": draft}, upsert=True
    )
    await db.kelurahan_info.delete_one({"_id": "draft"})
    # Audit log: capture what changed
    changed_fields = []
    for k, v in draft.items():
        if published_before.get(k) != v:
            changed_fields.append(k)
    await db.publish_logs.insert_one({
        "id": str(uuid.uuid4()),
        "type": "info",
        "user_email": current["email"],
        "user_id": current["id"],
        "changed_fields": changed_fields,
        "snapshot": {k: draft.get(k) for k in changed_fields},
        "published_at": datetime.now(timezone.utc).isoformat(),
    })
    return KelurahanInfo(**draft)


@api.get("/info/publish-log")
async def get_publish_log(current=Depends(get_current_admin)):
    docs = await db.publish_logs.find({"type": "info"}, {"_id": 0}).sort("published_at", -1).limit(50).to_list(50)
    return docs


@api.delete("/info/draft")
async def discard_draft(current=Depends(get_current_admin)):
    await db.kelurahan_info.delete_one({"_id": "draft"})
    return {"ok": True}


# ---- Contacts ----
@api.get("/contacts", response_model=List[Contact])
async def list_contacts(category: Optional[str] = None, q: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"role": {"$regex": q, "$options": "i"}},
            {"wilayah": {"$regex": q, "$options": "i"}},
            {"phone": {"$regex": q, "$options": "i"}},
        ]
    docs = await db.contacts.find(query, {"_id": 0}).sort("subcategory", 1).to_list(1000)
    return docs


@api.post("/contacts", response_model=Contact)
async def create_contact(body: ContactCreate, current=Depends(get_current_admin)):
    c = Contact(**body.model_dump())
    await db.contacts.insert_one(c.model_dump())
    return c


@api.put("/contacts/{contact_id}", response_model=Contact)
async def update_contact(contact_id: str, body: ContactCreate, current=Depends(get_current_admin)):
    existing = await db.contacts.find_one({"id": contact_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Kontak tidak ditemukan")
    updated = {**existing, **body.model_dump()}
    await db.contacts.update_one({"id": contact_id}, {"$set": updated})
    return updated


@api.delete("/contacts/{contact_id}")
async def delete_contact(contact_id: str, current=Depends(get_current_admin)):
    res = await db.contacts.delete_one({"id": contact_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Kontak tidak ditemukan")
    return {"ok": True}


# ---- Announcements ----
@api.get("/announcements", response_model=List[Announcement])
async def list_announcements():
    docs = await db.announcements.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return docs


@api.post("/announcements", response_model=Announcement)
async def create_announcement(body: AnnouncementCreate, current=Depends(get_current_admin)):
    a = Announcement(**body.model_dump())
    await db.announcements.insert_one(a.model_dump())
    return a


@api.delete("/announcements/{aid}")
async def delete_announcement(aid: str, current=Depends(get_current_admin)):
    await db.announcements.delete_one({"id": aid})
    return {"ok": True}


# ---- Agenda ----
@api.get("/agenda", response_model=List[Agenda])
async def list_agenda():
    docs = await db.agenda.find({}, {"_id": 0}).sort("date", 1).to_list(200)
    return docs


@api.post("/agenda", response_model=Agenda)
async def create_agenda(body: AgendaCreate, current=Depends(get_current_admin)):
    a = Agenda(**body.model_dump())
    await db.agenda.insert_one(a.model_dump())
    return a


@api.delete("/agenda/{aid}")
async def delete_agenda(aid: str, current=Depends(get_current_admin)):
    await db.agenda.delete_one({"id": aid})
    return {"ok": True}


# ---- Pengurus ----
@api.post("/pengurus/reorder")
async def reorder_pengurus(payload: dict, current=Depends(get_current_admin)):
    ids = payload.get("ids", [])
    for i, pid in enumerate(ids):
        await db.pengurus.update_one({"id": pid}, {"$set": {"order": i + 1}})
    return {"ok": True}


# ---- File Upload ----
MIME = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "gif": "image/gif", "webp": "image/webp"}


@api.post("/upload")
async def upload_file(file: UploadFile = File(...), replace_path: Optional[str] = Form(None), current=Depends(get_current_admin)):
    ext = (file.filename.rsplit(".", 1)[-1] if "." in file.filename else "bin").lower()
    ct = file.content_type or MIME.get(ext, "application/octet-stream")
    data = await file.read()
    if len(data) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File melebihi 5MB")
    path = f"{APP_NAME}/uploads/{uuid.uuid4()}.{ext}"
    result = put_object(path, data, ct)
    await db.files.insert_one({
        "id": str(uuid.uuid4()),
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": ct,
        "size": result.get("size", len(data)),
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    # Soft-delete the old file if replace_path provided
    if replace_path:
        rp = replace_path
        if rp.startswith("/api/files/"):
            rp = rp[len("/api/files/"):]
        if rp.startswith(f"{APP_NAME}/"):
            await db.files.update_one({"storage_path": rp}, {"$set": {"is_deleted": True, "deleted_at": datetime.now(timezone.utc).isoformat()}})
    return {"url": f"/api/files/{result['path']}", "path": result["path"]}


@api.get("/files/{path:path}")
async def download_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File tidak ditemukan")
    data, ct = get_object(path)
    return Response(content=data, media_type=record.get("content_type", ct), headers={"Cache-Control": "public, max-age=86400"})


# ---- Pengurus CRUD (rest) ----
@api.get("/pengurus", response_model=List[Pengurus])
async def list_pengurus():
    docs = await db.pengurus.find({}, {"_id": 0}).sort("order", 1).to_list(200)
    return docs


@api.post("/pengurus", response_model=Pengurus)
async def create_pengurus(body: PengurusCreate, current=Depends(get_current_admin)):
    p = Pengurus(**body.model_dump())
    await db.pengurus.insert_one(p.model_dump())
    return p


@api.put("/pengurus/{pid}", response_model=Pengurus)
async def update_pengurus(pid: str, body: PengurusCreate, current=Depends(get_current_admin)):
    existing = await db.pengurus.find_one({"id": pid}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Pengurus tidak ditemukan")
    updated = {**existing, **body.model_dump()}
    await db.pengurus.update_one({"id": pid}, {"$set": updated})
    return updated


@api.delete("/pengurus/{pid}")
async def delete_pengurus(pid: str, current=Depends(get_current_admin)):
    res = await db.pengurus.delete_one({"id": pid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pengurus tidak ditemukan")
    return {"ok": True}


# ---- Startup: seed data ----
async def seed_admin():
    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "name": "Admin Kelurahan",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
        await db.users.update_one(
            {"email": ADMIN_EMAIL},
            {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}},
        )


async def seed_dummy_data():
    if await db.contacts.count_documents({}) > 0:
        return

    contacts = [
        # Emergency - RT/RW
        {"category": "emergency", "subcategory": "rt_rw", "name": "Bpk. Suhendra", "role": "Ketua RW 01", "phone": "081234567001", "whatsapp": "6281234567001", "wilayah": "RW 01", "status": "available", "photo_url": "https://i.pravatar.cc/150?img=12"},
        {"category": "emergency", "subcategory": "rt_rw", "name": "Bpk. Wahyudi", "role": "Ketua RW 02", "phone": "081234567002", "whatsapp": "6281234567002", "wilayah": "RW 02", "status": "available", "photo_url": "https://i.pravatar.cc/150?img=13"},
        {"category": "emergency", "subcategory": "rt_rw", "name": "Ibu Siti Aminah", "role": "Ketua RT 01/RW 01", "phone": "081234567003", "whatsapp": "6281234567003", "wilayah": "RT 01/RW 01", "status": "available", "photo_url": "https://i.pravatar.cc/150?img=45"},
        {"category": "emergency", "subcategory": "rt_rw", "name": "Bpk. Herman", "role": "Ketua RT 02/RW 01", "phone": "081234567004", "whatsapp": "6281234567004", "wilayah": "RT 02/RW 01", "status": "busy", "photo_url": "https://i.pravatar.cc/150?img=14"},
        # Emergency - Ambulance
        {"category": "emergency", "subcategory": "ambulan", "name": "Ambulans Kelurahan 01", "role": "Unit Gawat Darurat", "phone": "118", "whatsapp": "6281234500118", "status": "available", "notes": "Standby 24 jam"},
        {"category": "emergency", "subcategory": "ambulan", "name": "Ambulans Puskesmas", "role": "Unit Rujukan", "phone": "119", "whatsapp": "6281234500119", "status": "busy", "notes": "Sedang bertugas"},
        # Emergency - Fire
        {"category": "emergency", "subcategory": "pemadam", "name": "Damkar Sektor 1", "role": "Pemadam Kebakaran", "phone": "113", "whatsapp": "6281234500113", "status": "available", "notes": "Respon cepat 5-10 menit"},
        # Emergency - Police
        {"category": "emergency", "subcategory": "polsek", "name": "Polsek Sukamaju", "role": "Kepolisian Sektor", "phone": "110", "whatsapp": "6281234500110", "status": "available", "notes": "Piket 24 jam"},
        {"category": "emergency", "subcategory": "polsek", "name": "Koramil 05", "role": "Komando Rayon Militer", "phone": "081234500511", "whatsapp": "6281234500511", "status": "available"},
        # Emergency - Health
        {"category": "emergency", "subcategory": "puskesmas", "name": "Puskesmas Sukamaju", "role": "Pusat Kesehatan Masyarakat", "phone": "021-5551234", "whatsapp": "6281234512345", "status": "available", "schedule": "24 jam"},
        {"category": "emergency", "subcategory": "puskesmas", "name": "Klinik Sehat Bersama", "role": "Klinik Umum", "phone": "021-5551122", "whatsapp": "6281234511122", "status": "available", "schedule": "08.00 - 21.00 WIB"},

        # Kader Posyandu
        {"category": "kader", "subcategory": "posyandu", "name": "Ibu Ratna Dewi", "role": "Kader Posyandu Melati", "phone": "081234570001", "whatsapp": "6281234570001", "wilayah": "RW 01", "schedule": "Setiap Rabu, 08.00-11.00", "photo_url": "https://i.pravatar.cc/150?img=48"},
        {"category": "kader", "subcategory": "posyandu", "name": "Ibu Sri Rahayu", "role": "Kader Posyandu Anggrek", "phone": "081234570002", "whatsapp": "6281234570002", "wilayah": "RW 02", "schedule": "Setiap Kamis, 08.00-11.00", "photo_url": "https://i.pravatar.cc/150?img=49"},
        # PKK
        {"category": "kader", "subcategory": "pkk", "name": "Ibu Endang Wijaya", "role": "Ketua PKK Kelurahan", "phone": "081234570003", "whatsapp": "6281234570003", "wilayah": "Kelurahan", "photo_url": "https://i.pravatar.cc/150?img=47"},
        {"category": "kader", "subcategory": "pkk", "name": "Ibu Yuliana", "role": "Sekretaris PKK", "phone": "081234570004", "whatsapp": "6281234570004", "wilayah": "Kelurahan", "photo_url": "https://i.pravatar.cc/150?img=44"},
        # Linmas
        {"category": "kader", "subcategory": "linmas", "name": "Bpk. Joko Santoso", "role": "Ketua Linmas RW 01", "phone": "081234570005", "whatsapp": "6281234570005", "wilayah": "RW 01", "schedule": "Ronda malam 22.00-04.00", "photo_url": "https://i.pravatar.cc/150?img=15"},
        {"category": "kader", "subcategory": "linmas", "name": "Bpk. Agus Prasetyo", "role": "Anggota Linmas", "phone": "081234570006", "whatsapp": "6281234570006", "wilayah": "RW 02", "schedule": "Ronda malam 22.00-04.00", "photo_url": "https://i.pravatar.cc/150?img=16"},
    ]
    for c_data in contacts:
        c = Contact(**c_data)
        await db.contacts.insert_one(c.model_dump())

    announcements = [
        {"title": "Kerja Bakti RW 01", "body": "Kerja bakti pembersihan lingkungan RW 01 hari Minggu, 08.00 WIB. Wajib bagi seluruh warga.", "priority": "urgent"},
        {"title": "Pembagian Sembako", "body": "Pembagian bantuan sembako untuk warga kurang mampu akan dilaksanakan Sabtu depan di kantor kelurahan.", "priority": "normal"},
        {"title": "Vaksinasi Booster", "body": "Program vaksinasi booster gratis di Puskesmas Sukamaju, Senin - Jumat pukul 08.00-14.00.", "priority": "normal"},
        {"title": "Peringatan Cuaca Ekstrem", "body": "BMKG memperingatkan potensi hujan lebat di wilayah kita. Waspada banjir dan pohon tumbang.", "priority": "urgent"},
    ]
    for a in announcements:
        await db.announcements.insert_one(Announcement(**a).model_dump())

    agenda = [
        {"title": "Rapat RT/RW Bulanan", "date": "2026-03-05", "time": "19.30 WIB", "location": "Aula Kelurahan", "description": "Rapat rutin koordinasi RT/RW seluruh kelurahan."},
        {"title": "Posyandu Balita", "date": "2026-03-08", "time": "08.00 WIB", "location": "Posyandu Melati RW 01", "description": "Timbang berat & imunisasi balita 0-5 tahun."},
        {"title": "Senam Sehat Bersama", "date": "2026-03-10", "time": "06.30 WIB", "location": "Lapangan Kelurahan", "description": "Senam sehat bersama untuk seluruh warga, gratis."},
        {"title": "Pelatihan UMKM", "date": "2026-03-15", "time": "09.00 WIB", "location": "Aula Kelurahan", "description": "Pelatihan digital marketing untuk pelaku UMKM."},
    ]
    for a in agenda:
        await db.agenda.insert_one(Agenda(**a).model_dump())


async def seed_pengurus():
    if await db.pengurus.count_documents({}) > 0:
        return
    pengurus = [
        {"name": "H. Budi Santoso, S.Sos., M.Si.", "position": "Lurah", "photo_url": "https://i.pravatar.cc/400?img=68", "phone": "081234500001", "email": "lurah@kelurahan.id", "bio": "Memimpin Kelurahan Sukamaju sejak 2022. Fokus pada digitalisasi layanan warga dan penguatan kesehatan masyarakat.", "order": 1},
        {"name": "Dra. Hj. Sri Mulyani", "position": "Sekretaris Kelurahan", "photo_url": "https://i.pravatar.cc/400?img=47", "phone": "081234500002", "email": "sekretaris@kelurahan.id", "bio": "Mengoordinasikan administrasi dan tata usaha kelurahan.", "order": 2},
        {"name": "Ir. Ahmad Rifai", "position": "Kasi Pemerintahan", "photo_url": "https://i.pravatar.cc/400?img=13", "phone": "081234500003", "email": "pemerintahan@kelurahan.id", "bio": "Mengurus dokumen kependudukan, KTP, KK, dan pelayanan legalitas warga.", "order": 3},
        {"name": "Dewi Anggraini, S.KM.", "position": "Kasi Kesejahteraan Sosial", "photo_url": "https://i.pravatar.cc/400?img=44", "phone": "081234500004", "email": "kesos@kelurahan.id", "bio": "Menangani bansos, program kesehatan, dan koordinasi Posyandu.", "order": 4},
        {"name": "Bpk. Rudi Hartono, S.T.", "position": "Kasi Pembangunan", "photo_url": "https://i.pravatar.cc/400?img=15", "phone": "081234500005", "email": "pembangunan@kelurahan.id", "bio": "Mengawasi infrastruktur, lingkungan, dan program pembangunan wilayah.", "order": 5},
        {"name": "Ibu Retno Wulandari, S.E.", "position": "Kasi Ekonomi & UMKM", "photo_url": "https://i.pravatar.cc/400?img=49", "phone": "081234500006", "email": "umkm@kelurahan.id", "bio": "Pendampingan UMKM warga dan program peningkatan ekonomi lokal.", "order": 6},
    ]
    for p in pengurus:
        await db.pengurus.insert_one(Pengurus(**p).model_dump())


@app.on_event("startup")
async def on_startup():
    await seed_admin()
    await seed_dummy_data()
    await seed_pengurus()
    logger.info("Startup complete: admin seeded, dummy data ready")


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
