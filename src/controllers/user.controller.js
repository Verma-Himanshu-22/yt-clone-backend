import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError}  from '../utils/ApiError.js'
import {User}  from '../models/user.models.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend -->
  // validation --> not empty
  // check if user already exits : username | email
  //  check for images and check for avatar
  // upload them  to cloudinary, avatar
  //create user object --> create entry in db
  // remove password and refresh token field from response
  // check for user creation -->
  // return response else send error

  const {fullName,email,username,password}=req.body
//   console.log("email :",email)

  if([fullName,email,username,password].some((field)=> field?.trim()==="")){
          throw new ApiError(409, "All fields are required and must not be empty");
  }
 const existedUSer=  await User.findOne({
      $or:[{username} , {email}]
  })
  if(existedUSer){
      throw  new ApiError(400,"User already  exists  with given username and email")
  }
//   console.log(req.files)
  const avatarLocalPath=req.files?.avatar?.[0]?.path
 const  coverImageLocalPath= req.files?.coverImage[0]?.path || null
//  console.log("avatarLocalPath:", avatarLocalPath);
// console.log("coverImageLocalPath:", coverImageLocalPath);


    if (!avatarLocalPath ) {
         throw new ApiError(400,"Avatar file is required")
    }

  const avatar= await uploadOnCloudinary(avatarLocalPath)
  const coverImage=await uploadOnCloudinary(coverImageLocalPath)

   if(!avatar){
        throw new ApiError(400,"Failed to upload avatar to Cloudinary")
   }

  const user= await User.create({
       fullName,
       avatar:avatar.url,
       coverImage:coverImage?.url || "",
       email,
       password,
       username:username.toLowerCase()
   })

  const createdUser= await User.findById(user._id).select(
    
        "-password -refreshToken"
    
  )
  if(!createdUser){
      throw new ApiError(500,"Something went wrong while registering the user")
  }

  return res.status(201).json(
      new ApiResponse(201,createdUser,"user registered successfully")
  )

})


export { registerUser };
