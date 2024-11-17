// // require('dotenv').config({path: './env'})

// import mongoose from "mongoose";
// import dotenv from "dotenv"
// import connectDB from "./db/index.js";
// import {app} from './app.js'
// dotenv.config({
//     path: './.env'
// })


// mongoose.connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     writeConcern: { w: "majority" }  // Change if needed
// });

// connectDB()
// .then(() => {
//     app.listen(process.env.PORT || 8000, () => {
//         console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
//     })
// })
// .catch((err) => {
//     console.log("MONGO db connection failed !!! ", err);
// })

import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from './app.js';

// Load environment variables
dotenv.config({
    path: './.env'
});

// Connect to MongoDB
const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            writeConcern: { w: "majority" } // Change if needed
        });
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MONGODB connection failed!!!", error);
        process.exit(1); // Exit the process with failure
    }
};

// Start the server
const startServer = () => {
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
        console.log(`⚙️ Server is running at port: ${port}`);
    });
};

// Execute the connection and server start
const init = async () => {
    await connectMongoDB();
    startServer();
};

init();











/*
import express from "express"
const app = express()
( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("errror", (error) => {
            console.log("ERRR: ", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("ERROR: ", error)
        throw err
    }
})()

*/