"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserProfileSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'users',
    },
    country: {
        type: String
    },
    membership: {
        type: String,
        default: "none"
    },
    leval: {
        type: String,
        enum: ["Grey", "Bronze", "Silver", "Gold", "Diamond", "Royal", "Legend"],
        default: "Grey"
    },
    league: {
        type: String,
    },
    interests: [{
            type: String
        }],
    aboutMe: {
        type: String
    },
    albums: [{
            albumName: {
                type: String
            },
            access: {
                type: String
            },
            images: [{ src: String }]
        }],
    profilePhoto: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    modifiedAt: {
        type: Date,
        default: Date.now
    },
});
exports.default = (0, mongoose_1.model)('UserProfile', UserProfileSchema);
