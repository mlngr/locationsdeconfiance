// Volatile storage for File objects that can't be serialized to localStorage
// Used to keep uploaded files between wizard steps

let volatileFiles: File[] = [];

export function setVolatileFiles(files: File[]) {
  volatileFiles = files;
}

export function getVolatileFiles(): File[] {
  return volatileFiles;
}

export function clearVolatileFiles() {
  volatileFiles = [];
}