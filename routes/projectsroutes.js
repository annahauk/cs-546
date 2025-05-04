import {Router} from 'express';
const router = Router();
import {getAllPosts, getPostById} from "../data/posts.js";
import {isLoggedIn} from "./middleware.js";

router.route('/')
    .get(isLoggedIn, async (req, res) => {
        try {
            const allPosts = await getAllPosts();
            res.render('project', {posts: allPosts});
        } catch (error) {
            console.error(error);
            res.status(500).render('error', {message: 'Internal server error'});
        }
    });

router.route('/:id')
    .get(isLoggedIn, async (req, res) => {
        try {
            const projectId = req.params.id;
            const post = await getPostById(projectId);
            if (!post) {
                return res.status(404).render('error', {message: 'Project not found'});
            }
            res.render('project', {post: post});
        } catch (error) {
            console.error(error);
            res.status(500).render('error', {message: 'Internal server error'});
        }
    });

export default router;