type TDraftMediaEntry = {
  blob: Blob
  createdAt: string
}

const DB_NAME = "post-draft-media"
const DB_VERSION = 1
const STORE_NAME = "media"

function openDb (): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function generateKey (): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
  const bytes = crypto.getRandomValues(new Uint8Array(21))
  let key = ""
  for (let i = 0; i < 21; i++) {
    key += chars[bytes[i] % chars.length]
  }
  return key
}

export async function saveMedia (file: File): Promise<Error | string> {
  try {
    const db = await openDb()
    const key = `image:${generateKey()}`
    const entry: TDraftMediaEntry = {
      blob: file,
      createdAt: new Date().toISOString(),
    }
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite")
      transaction.objectStore(STORE_NAME).put(entry, key)
      transaction.oncomplete = () => resolve(key)
      transaction.onerror = () => reject(transaction.error)
    })
  } catch (error: any) {
    return new Error(error?.message ?? "Failed to save media")
  }
}

export async function loadMedia (key: string): Promise<Error | TDraftMediaEntry | undefined> {
  try {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly")
      const request = transaction.objectStore(STORE_NAME).get(key)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } catch (error: any) {
    return new Error(error?.message ?? "Failed to load media")
  }
}

export async function deleteMedia (key: string): Promise<Error | void> {
  try {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite")
      transaction.objectStore(STORE_NAME).delete(key)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  } catch (error: any) {
    return new Error(error?.message ?? "Failed to delete media")
  }
}
