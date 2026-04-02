"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AdvertiserAlbumSchema = new mongoose_1.Schema({
    advertiserId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "users",
    },
    albumName: {
        type: String,
    },
    images: [
        {
            imageUrl: {
                type: String,
            },
            index: {
                type: Number,
                default: 0,
            },
            // 0 = pending, 1 = approved, 2 = rejected
            imageStatus: {
                type: Number,
                enum: [0, 1, 2],
                default: 1,
            },
            size: {
                type: String
            },
            imageName: {
                type: String
            }
        },
    ],
    // 0 = inactive, 1 = active, 2 = deleted
    status: {
        type: Number,
        enum: [0, 1, 2],
        default: 1,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});
const AdvertiserAlbum = (0, mongoose_1.model)("advertiseralbum", AdvertiserAlbumSchema);
exports.default = AdvertiserAlbum;
