require("dotenv").config();
const express = require("express");

const app = express();
const bodyparser = require("body-parser");
const cors = require("cors");
const PORT = process.env.PORT || 3000;

const shopRouter = require("./routes/shopRoute");
const categoryRouter = require("./routes/categoryRoute");

app.use(bodyparser.json());
app.use(express.json());
app.use(bodyparser.urlencoded({extended:true}));
app.use(cors());

app.use("/api/shop",shopRouter);
app.use("/api/category",categoryRouter);

app.listen(PORT,()=>{
    console.log(`server started on port number ${PORT}`);
})