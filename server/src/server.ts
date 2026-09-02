import "dotenv/config";
import { server } from "./app";
import { connectDB } from "./config/database";


const PORT = process.env.PORT || 5000;






connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

  
}).catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
