import { Auth } from '../src/lib/auth.js';

export const isLoggedIn = async (req, res, next) => {
    try {
        await Auth(req, res, () => {
            if (req.authorized) {
                next();
            } else {
                return res.redirect('/auth/login');
            }
        });
    } catch (error) {
        console.error('Error in isLoggedIn:', error);
        return res.status(500).render('error', {message: 'Internal server error'});
    }
};