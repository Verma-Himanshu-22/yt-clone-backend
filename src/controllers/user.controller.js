import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async(userId)=>
{
  try {
      const user= await User.findById(userId)
     const accessToken= user.generateAccessToken()
      const refreshToken=user.generateRefreshToken()

      // putting refresh token into the database
     user.refreshToken=refreshToken
    await user.save({validateBeforeSave:false})

    return {accessToken,refreshToken}

  } catch (error) {
    throw new ApiError(500,"something went wrong while generating refresh and access token")
  }
}
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

  const { fullName, email, username, password } = req.body;
  //   console.log("email :",email)

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(409, "All fields are required and must not be empty");
  }
  const existedUSer = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUSer) {
    throw new ApiError(
      400,
      "User already  exists  with given username and email"
    );
  }
  //   console.log(req.files)
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path || null;
  //  console.log("avatarLocalPath:", avatarLocalPath);
  // console.log("coverImageLocalPath:", coverImageLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar to Cloudinary");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "user registered successfully"));
});



const loginUser = asyncHandler(async (req, res) => {
  // bring data from req. body
  // username or email using one of which user can login
  // find the user either username or email --> from db
  //check if password is correct
  //access and refresh token genratation and send it to the user
  // send cookie

  const { email, password, username } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "username or email at least one field is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "user does not exists.");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User Credentials.");
  }

 const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)

 const loggedInUser=  await User.findById(user._id).select("-password -refreshToken")
  const options={
       httpOnly:true,
       secure:true
  }

  return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options)
  .json(
     new ApiResponse(200,{
         user:loggedInUser,accessToken,refreshToken
     },"User loggedIn Successfully")
  )


});


const logoutUser= asyncHandler  (async (req,res)=>{
     await  User.findByIdAndUpdate(req.user._id,{
         $set:{
           refreshToken:undefined
         }
       },{
           new:true
       }) 
         const options={
       httpOnly:true,
       secure:true
  }

   res.status(200).clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
})

  const refreshAccessToken=  asyncHandler(async (req,res)=>{
       const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken
       if(!incomingRefreshToken){
          throw new ApiError(401,"Unauthorized request")
       }
       
     try {
      const decodedToken= jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
        )
 
       const user=await User.findById(decodedToken?._id)
          if(!user){
           throw new ApiError(401,"Invalid refresh token")
        }
        if(incomingRefreshToken !==user?.refreshToken){
                       throw new ApiError(401,"Refresh token is expired or used")
        }
 
        const options={
           httpOnly:true,
           secure:true
        }
 
        const{accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(user._id)
 
 
        return res.status(200).cookie("accessToken",accessToken).cookie("refreshToken",newRefreshToken).json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "access token refreshed"))

        
 
      } catch (error) {
            throw new ApiError(401,error?.message || "Invalid refresh token")
            
      }
   })

export { registerUser, loginUser,logoutUser,refreshAccessToken };
