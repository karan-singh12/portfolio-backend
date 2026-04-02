"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectFields = exports.sendEmail = void 0;
exports.slugGenrator = slugGenrator;
exports.listing = listing;
exports.generatePassword = generatePassword;
const nodemailer_1 = __importDefault(require("nodemailer"));
// Utility function to generate slugs from titles
function slugGenrator(title) {
    let slug = title;
    // Remove special characters
    slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, "");
    // Replace spaces with dash symbols
    slug = slug.replace(/ /gi, "-");
    // Remove consecutive dash symbols
    slug = slug.replace(/\-\-\-\-\-/gi, "-");
    slug = slug.replace(/\-\-\-\-/gi, "-");
    slug = slug.replace(/\-\-\-/gi, "-");
    slug = slug.replace(/\-\-/gi, "-");
    // Remove unwanted dash symbols at the beginning and end of the slug
    slug = "@" + slug + "@";
    slug = slug.replace(/\@\-|\-\@|\@/gi, "");
    return slug;
}
// Listing function to query data from MongoDB
async function listing(collectionName, population, condition, projection, sort, pageNumber, pageSize) {
    try {
        const result = await collectionName
            .find(condition, projection)
            .collation({ locale: "en" })
            .sort(sort)
            .skip(pageSize * pageNumber)
            .limit(Number(pageSize))
            .populate(population);
        return result;
    }
    catch (error) {
        console.error(error);
        return [];
    }
}
const sendEmail = async (options) => {
    return new Promise((resolve, reject) => {
        const mailTransporter = nodemailer_1.default.createTransport({
            host: process.env.HOST,
            port: Number(process.env.EMAIL_PORT),
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASS,
            },
        });
        const message = {
            from: `Okready <${process.env.EMAIL}>`,
            to: options.email,
            subject: options.subject,
            html: options.message,
        };
        mailTransporter
            .sendMail(message)
            .then(() => {
            console.log("Email sent");
            resolve(1);
        })
            .catch((error) => {
            console.error("Error sending email", error);
            resolve(0);
        });
    });
};
exports.sendEmail = sendEmail;
const projectFields = () => ({
    _id: 1,
    categoryType: 1,
    profilePhoto: 1,
    country: 1,
    streamingFrom: 1,
    albums: 1,
    'modelDetails._id': 1,
    'modelDetails.username': 1,
    'modelDetails.email': 1,
    'modelDetails.isOnline': 1,
});
exports.projectFields = projectFields;
function generatePassword(length = 12) {
    const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialCharacters = '!@#$%&';
    // Ensure the password contains at least one uppercase letter, one number, and one special character
    let password = [
        uppercaseLetters[Math.floor(Math.random() * uppercaseLetters.length)],
        numbers[Math.floor(Math.random() * numbers.length)],
        specialCharacters[Math.floor(Math.random() * specialCharacters.length)],
    ];
    // Fill the rest of the password length with random choices from all character sets
    const allCharacters = uppercaseLetters + lowercaseLetters + numbers + specialCharacters;
    for (let i = password.length; i < length; i++) {
        password.push(allCharacters[Math.floor(Math.random() * allCharacters.length)]);
    }
    // Shuffle the password array
    password = password.sort(() => Math.random() - 0.5);
    // Return the password as a string
    return password.join('');
}
