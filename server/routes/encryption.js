import crypto from 'crypto';

const cryptoSecret = process.env.CRYPTO_SECRET;
const alg = process.env.ALGORITHM;
const salt = process.env.CRYPTO_SALT;
const enc = 'utf8';
const type = 'hex';

const encrypt = (req, res, next) => {
    const clearText = res.locals.clearText;
    
    // Use the async `crypto.scrypt()` instead.
    const key = crypto.scryptSync(cryptoSecret, salt, 24);
    // Use `crypto.randomBytes` to generate a random iv instead of the static iv
    // shown here.
    const iv = Buffer.alloc(16, 0); // Initialization vector.

    const cipher = crypto.createCipheriv(alg, key, iv);

    let encrypted = cipher.update(clearText, enc, type);
        encrypted += cipher.final(type);

    res.locals.encrypted = encrypted;
    next();
};

const decrypt = (req, res, next) => {
    if (res.locals.encrypted) {
        // Use the async `crypto.scrypt()` instead.
        const key = crypto.scryptSync(cryptoSecret, salt, 24);
        // The IV is usually passed along with the ciphertext.
        const iv = Buffer.alloc(16, 0); // Initialization vector.
        
        const decipher = crypto.createDecipheriv(alg, key, iv);
        
        // Encrypted using same algorithm, key and iv.
        const encrypted = res.locals.encrypted;
        let decrypted = decipher.update(encrypted, type, enc);
        decrypted += decipher.final(enc);
        console.log(decrypted);
        // Prints: some clear text data
        res.locals.encrypted = null;
    }
    next();
}

export const encryptPW = [
    (req, res, next) => {
        res.locals.clearText = req.body.password;
        next();
    },
    encrypt
];