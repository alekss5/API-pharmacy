const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");

app.use("/auth", authRoutes);
app.use("/product", productRoutes);
app.use('/uploads', express.static('./uploads'));

app.use((error, req, res, next) => {

  const status = error.statusCode || 500; // Fallback to 500 if no statusCode is set
  const message = error.message || 'An unknown error occurred';
  const data = error.data;
  res.status(status).json({ message, data });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then((result) => {
    const server = app.listen(8080);
    //const server = https.createServer({key:privateKey,cert:certificate},app).listen(8080);

    console.log("Connected to Mongoose");
    // const io = require('./socket').init(server);
    // io.on('connection', socket => {
    //   console.log('Client connected');
    // });
  })
  .catch((err) => {
    console.log(err);
  });
