// require('dotenv').config()

import dotenv from "dotenv";
import connectDB from './db/index.js'; // ✅ Fix this
import app from "./app.js";

dotenv.config();



connectDB()
.then(()=>{
     const server= app.listen(process.env.PORT||5000,()=>{
          console.log(`listening on port : ${process.env.PORT}`)
      })
      server.on("error",(err)=>{
           console.error("Server startup error :",err.message)
           process.exit(1)
      })
})
.catch((err)=>{
       console.log("MongoDB connection failed !!",err)
       process.exit(1)
})

/*

import express from 'express'
const app=express()
;(async ()=>{
   try {
     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
     console.log("connected to DB")
     app.on('error',(e)=>{
           console.log("error occurred")
           throw e
     })

     app.listen(process.env.PORT,()=>{
          console.log(`App listening on port ${process.env.PORT}`)
     })
   } catch (error) {
      console.log(error)
      throw error
   }
})()

*/
