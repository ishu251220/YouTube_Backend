import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { video } from "../models/video.model.js"
import { Like } from "../models/like.model.js"



const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    const videos = await video.findById(videoId);

    if(!videos){
        throw new ApiError(400,"video not found");
    }

    const commentAggregate = await Comment.aggregate([
       {
        $match:{
            video : new mongoose.Types.ObjectId(videoId)
        }
       },
       {
        $lookup:{
            from:"User",
            localField:"owner",
            foreignField:"_Id",
            as:"owner"
        }
       },
       {
        //get comment details of than comment of video
        $lookup:{
            from:"Like",
            localField:"_id",
            foreignField:"comment",
            as:"Like"
        }
       },
       {
        $addFields:{
            likeCount:{
                $size : "$Like"
            },
            owner:{
                $first:"$owner"
            },
            isLiked:{
                $cond:{
                    if : { $in : [req.user?._id , "$Like.likeBy"] },
                    then : true ,
                    else : false
                }
            },
        },
       },
       {
        $sort:{
            createdAt:-1
        }
       },
       {
        $project:{
            content: 1,
            createdAt: 1,
            likesCount: 1,
            owner: {
                username: 1,
                fullName: 1,
                "avatar.url": 1
            },
            isLiked: 1
        }
    }
])

const option = {
    page : parseInt(page , 10),
    limit: parseInt(limit , 10)
}

const comments = await Comment.aggregatePaginate(
    commentAggregate ,
    option
)

return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"));

})


const addComment = asyncHandler(async (req, res) => {
    //add a comment to a video
    const {videoId} = req.params;
    const {content} = req.body;

    if(!content){
        throw new ApiError(400,"content must be required")
    }

    const _video = await video.findById(videoId);

    if(!_video){
        throw new ApiError(400,"fail to find video ! invalid videoId");
    }

    const createComment = await Comment.create({
        content ,
        video : videoId ,
        owner : req.user?._id 
    })

    if (!createComment) {
        throw new ApiError(500, "Failed to add comment please try again");
    }

    return res
    .status(201)
    .json(new ApiResponse(201, createComment, "Comment added successfully"));

})

const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    const {content} = req.body;

    if(!content){
        throw new ApiError(400,"comment not found");
    }

    const _comment = await Comment.findById(commentId);

    if(!_comment){
        throw new ApiError(400,"comment not found");
    }

    if(_comment?.owner.toString() != req.user?._id.toString()){
        throw new ApiError(400, "only comment owner can edit their comment");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        _comment?._id , 
        {
            $set:{content}
        },
        {new:true}
    )

    if (!updatedComment) {
        throw new ApiError(500, "Failed to edit comment please try again");
    }

    return res.status(200).json( 
        new ApiResponse(200, updatedComment, "Comment edited successfully")
    )

})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;

    const comment = await Comment.findById(commentId);

    if(!comment){
        throw new ApiError(400,"comment not found");
    }

    if(comment?.owner.toString() != req.user?._id.toString()){
        throw new ApiError(400,"only owner can delete comment")
    }

    await Comment.findByIdAndDelete(commentId);

    //also delete like data of that comment 
    await Like.deleteMany({
        comment : commentId,
        likeBy : req.user
    })

    return res.status(200).json( new ApiResponse(200,{commentId},"comment deleted successfully"))

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }