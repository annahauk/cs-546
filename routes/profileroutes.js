import {Router} from 'express';
const router = Router();
import {getUserById} from "../data/users.js";
import {isLoggedIn} from "./middleware.js";
import { idVal, stringVal } from '../helpers.js';
import path from 'path';
import multer from 'multer';
import fs from 'fs/promises';

// https://www.npmjs.com/package/multer
// Store uploaded resume file temporarily in ../uploads
const upload = multer({
    dest: path.join(__dirname, '../uploads'),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB 
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed.'));
        }
    }
});

router.route('/:id')
    .get(isLoggedIn, async (req, res) => {
        // Display a user profile
        try {
            const userId = idVal(req.params.id);
            const user = await getUserById(userId);
            if (!user) {
                return res.status(404).render('error', {message: 'User not found'});
            }
            res.render('profile', {user: user});
        } catch (error) {
            console.error(error);
            res.status(500).render('error', {message: 'Internal server error'});
        }
    });
router.route('/:id/edit')
    .get(isLoggedIn, async (req, res) => {
        // Display edit profile page
        try {
            const userId = idVal(req.params.id);
            const user = await getUserById(userId);
            if (!user) {
                return res.status(404).render('error', {message: 'User not found'});
            }
            if (user.user_name !== stringVal(req.body.username)) {
                return res.status(403).render('error', {message: 'You can only edit your own profile.'});
            }
            res.render('editProfile', {user: user});
        } catch (error) {
            res.status(500).render('error', {message: 'Internal server error'});
        }
    })
    .post(isLoggedIn, async (req, res) => {
        // Perform an update
        try {
            const userId = idVal(req.params.id);
            const user = await getUserById(userId);
            if (!user) {
                return res.status(404).render('error', {message: 'User not found'});
            }
            if (user.user_name !== stringVal(req.body.username)) {
                return res.status(403).render('error', {message: 'You can only edit your own profile.'});
            }

            // TODO
            // Implement profile updating features
            // After done, hitting "save" will redirect back to profile view

            res.render('profile', {user: user});
        } catch (error) {
            res.status(500).render('error', {message: 'Internal server error'});
        }
    });
router.route('/:id/resume')
    .post(isLoggedIn, upload.single('resume'), async (req, res) => {
        try {
            const userId = idVal(req.params.id);
            const user = await getUserById(userId);
            if (!user) {
                return res.status(404).render('error', {message: 'User not found'});
            }
            if (user.user_name !== stringVal(req.body.username)) {
                return res.status(403).render('error', {message: 'You can only edit your own profile.'});
            }
            if (!req.file) {
                return res.status(400).render('error', {message: 'No file uploaded'});
            }

            const tags = await processUploadedResume(req.file);
            // https://www.geeksforgeeks.org/node-js-fs-unlink-method/
            await fs.unlink(req.file.path);
            const newTags = [...new Set([...tags.ProgrammingLanguages, ...tags.Libraries, ...tags.Frameworks, ...tags.Tools, ...tags.CloudPlatforms])];
            await updateUserTags(userId, newTags);
            res.status(200).json({message: 'Resume uploaded successfully!'});
        } catch (error) {
            res.status(500).render('error', {message: 'Internal server error'});
        }
    });

export default router;