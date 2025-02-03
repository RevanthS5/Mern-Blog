const express = require('express')
require('dotenv').config()
const {connect} = require("mongoose")
const cors = require('cors')
const upload = require('express-fileupload')
const path = require('path');

const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const {notFound, errorHandler} = require('./middleware/errorMiddleware')

const app = express();
app.use(express.json({extended: true}))
app.use(express.urlencoded({extended: true}))
const allowedOrigins = ["http://localhost:3000", "https://your-frontend.vercel.app"];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));
app.use(upload())

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);



app.use(notFound)
app.use(errorHandler)


connect(process.env.MONGO_URI)
.then(app.listen(process.env.PORT || 8080, () => console.log(`Server running on port  ${process.env.PORT}`)))
.catch(error => console.log(error))

module.exports = app;

