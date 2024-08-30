import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const API_URL = process.env.URL;
const API_GMAIL = async () => {
  return await axios({
    method: "post",
    url: `${API_URL}/endpoint`,
    data: {},
  });
};
export default API_GMAIL;
