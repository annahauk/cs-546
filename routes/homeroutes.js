import {Router} from 'express';
const router = Router();
import {isLoggedOut} from "./middleware.js";

router.route('/')
    .get(isLoggedOut, (req, res) => {
        // add whatever the handlebars need
        res.render('home', {});
    });