import { sendMail } from "./mailer";
import { Document, Model, Types } from "mongoose";

// Utility function to generate slugs from titles
function slugGenrator(title: string): string {
  let slug = title;

  // Remove special characters
  slug = slug.replace(
    /\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi,
    ""
  );

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
async function listing<T extends Document>(
  collectionName: Model<T>,
  population: string[],
  condition: Record<string, any>,
  projection: Record<string, any>,
  sort: Record<string, any>,
  pageNumber: number,
  pageSize: number
): Promise<T[]> {
  try {
    const result = await collectionName
      .find(condition, projection)
      .collation({ locale: "en" })
      .sort(sort)
      .skip(pageSize * pageNumber)
      .limit(Number(pageSize))
      .populate(population);
    
    return result;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Email sending function
interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

// Sends through Resend (see utils/mailer.ts). Resolves 1 if sent, 0 if not (same contract as before).
const sendEmail = async (options: EmailOptions): Promise<number> => {
  const ok = await sendMail({ to: options.email, subject: options.subject, text: options.message.replace(/<[^>]+>/g, " ").replace(/s+/g, " ").trim(), html: options.message });
  return ok ? 1 : 0;
};

const projectFields = () => ({
  _id: 1,
  categoryType: 1,
  profilePhoto: 1,
  country: 1,
  streamingFrom: 1,
  albums:1,
  'modelDetails._id': 1,
  'modelDetails.username': 1,
  'modelDetails.email': 1,
  'modelDetails.isOnline': 1,
});

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

export { slugGenrator, listing, sendEmail, projectFields, generatePassword };
