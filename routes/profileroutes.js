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
    }).post(isLoggedIn, async (req, res) => {
        // Update user profile
        try {
            const userId = idVal(req.params.id);
            const user = await getUserById(userId);
            if (!user) {
                return res.status(404).render('error', {message: 'User not found'});
            }
            if (user.user_name !== stringVal(req.body.username)) {
                return res.status(403).render('error', {message: 'You can only update your own profile.'});
            }

            // TODO: updating user profile
            // Depending on data file implementation 

            res.status(200).json({message: 'Profile updated successfully.'});
        } catch (error) {
            console.error(error);
            res.status(500).render('error', {message: 'Internal server error'});
        }
    });

export default router;