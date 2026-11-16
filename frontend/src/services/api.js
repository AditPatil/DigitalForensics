
const API_BASE_URL = `http://${window.location.hostname}:8000`;

export async function analyzeImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Image analysis failed.");
  }

  return response.json();
}

export function getElaUrl(imageUrl) {
  return `${API_BASE_URL}${imageUrl}`;
}
