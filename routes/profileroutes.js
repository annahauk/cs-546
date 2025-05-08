import {Router} from 'express';
const router = Router();
import {getUserById} from "../data/users.js";
import {isLoggedIn} from "./middleware.js";
import { idVal } from '../helpers.js';

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

export default router;