import {Router} from 'express';
const router = Router();
import {isLoggedIn} from "./middleware";

router.route('/')
    .get(isLoggedIn, async (req, res) => {
        try {
            // TODO: pass in whatever the handlebars need
            res.render('home', {});
        } catch (error) {
            console.error(error);
            res.status(500).render('error', {message: 'Internal server error'});
        }
    });

export default router;