// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const { env_data } = require("./config/config");

// Initialize Express app
const app = express();
const port = 3000;

const REGION = env_data.REGION;
const BUCKET = env_data.BUCKET;

const users = [];
const files = ["ram.png", "main.py", "index.html", "script.sh"];

// Secret key for JWT signing
const secretKey = process.env.JWT_SECRET_KEY;

const client = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    }
});

// Middleware to parse JSON body
app.use(bodyParser.json());
app.use(cors());

const usernameVerify = (username) => {
    return users.find(user => user.username === username);
}
// Route for user sign-up
app.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if username already exists
        if (usernameVerify(username)) {
            return res.status(400).json({ message: 'username',  success: false });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Store user data
        users.push({ username, password: hashedPassword, files: 0 });

        res.status(201).json({ message: `${username} User signed up successfully`, success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
});
const validUser = (username) => {
    // Temporary user validation 
    // Todo database validation
    const user = users.find(user => user.username === username);
    return user;
}

// Route for user sign-in
app.post('/signin', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by username
        user = validUser(username);

        // Check if user exists
        if (!user) {
            return res.status(401).json({ message: 'username' , success: false });
        }

        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'password', success: false });
        }

        // Generate JWT token
        const token = jwt.sign({ username: user.username }, secretKey, { expiresIn: 60 * 60 });

        res.json({ token, success: true });
        console.log(`${user.username} signed in.`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {


    if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Unauthorized: Missing token' });
    }
    const token = req.headers.authorization.split(' ')[1];

    try {
        // console.log(`${token}`);
        const decoded = jwt.verify(token, secretKey);

        // req.user = decoded;
        // next();

        if (usernameVerify(decoded.username)) {
            req.user = decoded;
            next();
        }
        else
            res.status(401).json({ message: 'token' });


    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'token' });
    }
};

// Protected route for testing JWT token verification
app.get('/protected', verifyToken, (req, res) => {
    res.json({ message: 'Protected route accessed successfully', user: req.user });
});

const createPresignedUploadUrl = ({ bucket, key }) => {
    const command = new PutObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(client, command, { expiresIn: 3600 });
};

const createPresignedDownloadUrl = ({ bucket, key }) => {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(client, command, { expiresIn: 3600 });
};

app.post('/presigneduploadurl', verifyToken, async (req, res) => {
    const KEY = req.body.key;
    try {
        const clientUrl = await createPresignedUploadUrl({
            bucket: BUCKET,
            key: KEY,
        });
        console.log(`[ ] One time Upload URL ${clientUrl}.`)
        res.json({ onetimeurl: clientUrl, Purpose: "put", success: true });
    }
    catch (err) {
        console.log(err);
        res.statusCode(401).json({ success: false });
    }
});

app.post('/presigneddownloadurl', verifyToken, async (req, res) => {
    const KEY = req.body.key;
    try {
        const clientUrl = await createPresignedDownloadUrl({
            bucket: BUCKET,
            key: KEY,
        });
        console.log(`[ ] One time Download URL ${clientUrl}.`)
        res.json({ onetimeurl: clientUrl, purpose: "get", success: true });
    }
    catch (err) {
        console.log(err);
        res.statusCode(401).json({ success: false });
    }
});

const getfilesLinks = (files, username) => {
    filesUrls = [];
    files.forEach(file => {
        filesUrls.push({ key: file, url: "http://".concat(file) });
    });
    return filesUrls;
}

app.post('/listfiles', verifyToken, async (req, res) => {
    try {
        const resp = {};
        resp.files = getfilesLinks(files, req.user.username);
        resp.success = true;
        res.json(resp);
    }
    catch {
        res.statusCode(401).json({ success: false });
    }
});
// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
