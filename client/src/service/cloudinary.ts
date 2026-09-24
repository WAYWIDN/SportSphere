import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export async function uploadFile(file: File): Promise<string> {
  const resource_type = file.type === "application/pdf" ? "raw" : "image";

  const sigRes = await axios.post(
    `${API_URL}/v1/upload/signed-url`,
    { resource_type },
    { withCredentials: true },
  );

  const { data } = sigRes.data;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", data.api_key);
  formData.append("timestamp", data.timestamp);
  formData.append("signature", data.signature);
  formData.append("folder", data.folder);

  const uploadPath = resource_type === "raw" ? "raw/upload" : "image/upload";

  const cloudRes = await axios.post(
    `https://api.cloudinary.com/v1_1/${data.cloud_name}/${uploadPath}`,
    formData,
  );

  return cloudRes.data.secure_url as string;
}
