// require('dotenv').config()

import dotenv from "dotenv";
import connectDB from './db/index.js'; // ✅ Fix this

dotenv.config();



connectDB()


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
