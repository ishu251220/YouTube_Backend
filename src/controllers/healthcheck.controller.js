import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const healthcheck = asyncHandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
    try {
        res.status(200).json(new ApiResponse(200, "Everything is okay in health"));
        console.log("Everything is okay in health");
        
    } catch (error) {
        throw new ApiError(400, "Something went wrong while writing the health check");
    } 
});  


export {
    healthcheck
    }
      