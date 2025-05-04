import {Router} from 'express';
const router = Router();
import {getUserById} from "../data/users.js";
import {isLoggedIn} from "./middleware.js";

router.route('/:id')
    .get(isLoggedIn, async (req, res) => {
        try {
            const userId = req.params.id;
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

export default router;