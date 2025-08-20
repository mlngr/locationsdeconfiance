// Client-only volatile storage for files that can't be persisted in localStorage
// Files survive navigation but not page refresh

let selectedFiles: File[] = [];

export function setWizardFiles(files: File[]) {
  selectedFiles = files;
}

export function getWizardFiles(): File[] {
  return selectedFiles;
}

export function clearWizardFiles() {
  selectedFiles = [];
}