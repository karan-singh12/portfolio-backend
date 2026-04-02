"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const modelCharacteristicsSchema = new mongoose_1.Schema({
    advertiserId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'users',
    },
    categoryType: {
        type: String,
        enum: ['Girl', 'Couple', 'Guy', 'Trans'],
    },
    age: {
        type: String
    },
    height: {
        type: String
    },
    weight: {
        type: String
    },
    hairColor: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'modelProfileTypes',
    },
    ethnicity: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'modelProfileTypes',
    },
    bodyType: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'modelProfileTypes',
    },
    eyeColorType: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'modelProfileTypes',
    },
    special: {
        type: String
    },
    interests: [{
            type: String
        }],
    languages: [{
            type: String
        }],
    subculture: [{
            type: String
        }],
    country: {
        type: String,
    },
    aboutMe: {
        type: String,
    },
    documentType: {
        type: String,
        enum: ["Passport", "National ID"],
    },
    idNumber: {
        type: String
    },
    idFrontImage: {
        type: String
    },
    idBackImage: {
        type: String
    },
    selfieWithId: {
        type: String
    },
    createdAt: {
        type: Date, default: Date.now
    },
    modifiedAt: {
        type: Date, default: Date.now
    },
});
exports.default = (0, mongoose_1.model)('modelCharacteristic', modelCharacteristicsSchema);
