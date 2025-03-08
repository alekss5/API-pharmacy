const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const multer = require("multer");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const fs = require("fs");

const https = require("https");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});
const accessLogStream  = fs.createWriteStream(path.join(__dirname,'access.log'), {flags:'a'})

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const app = express();
app.use(helmet())
app.use(compression());
app.use(morgan('combined',{stream:accessLogStream}));
app.use(cors())

const privateKey = fs.readFileSync('server.key')
const certificate = fs.readFileSync('server.cert')

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

dotenv.config();




app.use(bodyParser.json());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode;
  const messsage = error.message;
  const data = error.data;
  res.status(status).json({ message: messsage, data: data });
});

mongoose.set("strictQuery", false);
const Post = require("./models/post");

mongoose
  .connect(process.env.MONGODB_URI)
  .then((result) => {
     const server = app.listen(8080);
    //const server = https.createServer({key:privateKey,cert:certificate},app).listen(8080);
    
    console.log("Connected to Mongoose");
    const io = require('./socket').init(server);
    io.on('connection', socket => {
      console.log('Client connected');
    });
  })
  .catch((err) => {
    console.log(err);
  });
