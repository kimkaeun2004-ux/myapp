import { compressDataUrl } from "@/lib/image/compress-data-url";

const DB_NAME = "yeoun-tickets";
const STORE = "backImages";
const DB_VERSION = 1;
export const BACK_IMAGE_DRAFT_KEY = "__draft__";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed"));
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
  });
}

function idKey(ticket: { id?: number }): string {
  return ticket.id != null ? `id:${ticket.id}` : "";
}

function sbKey(ticket: { supabaseId?: string }): string {
  return ticket.supabaseId ? `sb:${ticket.supabaseId}` : "";
}

function storageKey(ticket: { id?: number; supabaseId?: string }, fallback?: string): string {
  if (fallback) return fallback;
  return sbKey(ticket) || idKey(ticket);
}

function allStorageKeys(ticket: { id?: number; supabaseId?: string }): string[] {
  const keys = [idKey(ticket), sbKey(ticket)].filter(Boolean);
  return [...new Set(keys)];
}

async function putImage(key: string, dataUrl: string): Promise<void> {
  if (!key || !dataUrl.trim()) return;

  let image = dataUrl;
  if (image.startsWith("data:image/")) {
    image = await compressDataUrl(image, {
      maxWidth: 960,
      maxHeight: 960,
      quality: 0.62,
    });
  }

  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(image, key);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error("IndexedDB put failed"));
    };
  });
}

async function getImage(key: string): Promise<string> {
  if (!key) return "";
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => {
      db.close();
      resolve(typeof req.result === "string" ? req.result : "");
    };
    req.onerror = () => {
      db.close();
      reject(req.error ?? new Error("IndexedDB get failed"));
    };
  });
}

async function deleteImage(key: string): Promise<void> {
  if (!key) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error("IndexedDB delete failed"));
    };
  });
}

export async function saveTicketBackImage(
  ticket: { id?: number; supabaseId?: string },
  dataUrl: string
): Promise<void> {
  const keys = allStorageKeys(ticket);
  if (keys.length === 0) return;
  await Promise.all(keys.map((key) => putImage(key, dataUrl)));
}

export async function loadTicketBackImage(ticket: {
  id?: number;
  supabaseId?: string;
}): Promise<string> {
  for (const key of allStorageKeys(ticket)) {
    const image = await getImage(key);
    if (image) return image;
  }
  return "";
}

/** Supabase id 연결 후 id: 키에 있던 뒷면 → sb: 키로 복사 */
export async function migrateTicketBackImageToSupabaseKey(ticket: {
  id?: number;
  supabaseId?: string;
}): Promise<void> {
  const from = idKey(ticket);
  const to = sbKey(ticket);
  if (!from || !to || from === to) return;

  const image = await getImage(from);
  if (image) await putImage(to, image);
}

export async function deleteTicketBackImage(ticket: {
  id?: number;
  supabaseId?: string;
}): Promise<void> {
  await Promise.all(allStorageKeys(ticket).map((key) => deleteImage(key)));
}

export async function saveBackImageDraft(dataUrl: string): Promise<void> {
  await putImage(BACK_IMAGE_DRAFT_KEY, dataUrl);
}

export async function loadBackImageDraft(): Promise<string> {
  return getImage(BACK_IMAGE_DRAFT_KEY);
}

export async function clearBackImageDraft(): Promise<void> {
  await deleteImage(BACK_IMAGE_DRAFT_KEY);
}
