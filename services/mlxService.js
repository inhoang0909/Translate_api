// mlxService.js
import axios from "axios";

const MLX_API_URL =
  process.env.MLX_API_URL || "http://10.13.34.181:11436/api/translate";

/**
 * Gọi sang MLX Translation server
 * @param {string} text - Văn bản gốc
 * @param {string[]} targetLangs - Danh sách ngôn ngữ đích
 * @param {string} model - model muốn sử dụng ("qwen3-8b", "qwen2.5-14b", "qwen3-30b")
 * @returns {Promise<Object>} - Kết quả từ MLX server (giữ nguyên format)
 */
export async function translateWithMlx(
  text,
  targetLangs = ["vi", "en", "zh-tw"],
  model = "qwen3-8b"
) {
  try {
    const payload = {
      requests: [
        {
          text,
          target_languages: targetLangs,
          model
        }
      ]
    };

    const response = await axios.post(MLX_API_URL, payload, {
      timeout: 60000,
      headers: {
        "Content-Type": "application/json"
      }
    });

    const data = response.data?.results?.[0];
    if (!data) throw new Error("Invalid response from MLX service");

    return data;
  } catch (err) {
    console.error("Error calling MLX service:", err.message);
    throw err;
  }
}
