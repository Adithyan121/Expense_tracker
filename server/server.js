const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ----- REQUIRED TO READ JSON -----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ----- CORS -----
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://expense-tracker-6vs5.vercel.app"
  ],
  credentials: true,
}));

// ----- DATABASE -----
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// ----- ROUTES -----
app.use("/api/auth", require("./routes/auth"));
app.use("/api/expenses", require("./routes/expenses"));
app.use("/api/ai", require("./routes/ai"));

app.get("/", (req, res) => {
  res.send("API is running...");
});

// ----- ERROR HANDLER -----
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server Error" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
