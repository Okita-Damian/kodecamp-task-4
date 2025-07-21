require("dotenv").config();
const app = require("./index");
const connection = require("./config/db");

const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connection();
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port} ...`);
    });
  } catch (error) {
    console.error("❌ Startup Failed", error.message);
    process.exit(1);
  }
};

startServer();
