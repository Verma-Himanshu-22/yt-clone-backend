import dotenv from 'dotenv'
dotenv.config()

import { v2 as cloudinary } from "cloudinary";
import fs  from 'fs'
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary=async (localFilePath)=>{
      try {
          if(!localFilePath)  return null;

          // upload the file on cloudinary

        const response=await  cloudinary.uploader.upload(localFilePath,{
             resource_type:"auto"
          })
          // file has been uplaoded successfully 
          // console.log(" file has been uplaoded successfully on cloudinary : ",response.url)

         
      fs.unlinkSync(localFilePath);
    
          return response


      } catch (error) {
         
      fs.unlinkSync(localFilePath);
     // remove locally saved temp. file if upload got failed 
          console.error("Error in uploading file: ",error)
          return null;
      }
}
export {uploadOnCloudinary}

