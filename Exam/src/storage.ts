import { SavedData, ClassId } from "./types.js";

const KEY = "ScuffedArpg-SaveData";

function read(): SavedData {
  const raw = localStorage.getItem(KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as SavedData;
  } catch {
    return {};
  }
}

function write(data: SavedData): void {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function saveLastClass(classId: ClassId): void {
  const current = read();
  write({ ...current, lastClass: classId });
}

export function loadSavedData(): SavedData {
  return read();
}
