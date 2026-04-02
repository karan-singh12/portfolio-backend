"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fxn = __importStar(require("../../controllers/admin/cms-management/cms.controller"));
const auth_middleware_1 = __importDefault(require("../../middleware/auth.middleware"));
const router = (0, express_1.Router)();
router.post("/addContent", auth_middleware_1.default, fxn.addContent);
router.post("/updateContent", auth_middleware_1.default, fxn.updateContent);
router.get("/getOneContent/:id", auth_middleware_1.default, fxn.getOneContent);
router.post("/getAllContent", auth_middleware_1.default, fxn.getAllContent);
router.post("/addAboutUs", auth_middleware_1.default, fxn.addAboutUs);
router.post("/updateAboutUs", auth_middleware_1.default, fxn.updateAboutUs);
router.get("/getAboutUsDetails/:id", auth_middleware_1.default, fxn.getAboutUsDetails);
router.post("/getAllModels", auth_middleware_1.default, fxn.getAllModels);
router.post("/changeStatus", auth_middleware_1.default, fxn.changeStatus);
exports.default = router;
