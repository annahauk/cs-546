import {Router} from 'express';
const router = Router();
import {getAllPosts, getPostById} from "../data/posts.js";
import { getUserByUsername } from '../data/users.js';
import { createComment } from "../data/comments.js";
import { isLoggedIn } from "./middleware.js";
import { stringVal, idVal } from '../helpers.js';

router.route('/')
    .get(isLoggedIn, async (req, res) => {
        try {
            // Filter by tags, languages, or active/inactive
            // Can change based on however we store the tags
            let tags = req.query;
            let allPosts = await getAllPosts();
            if (tags) {
                // trim and lowercase may be redundant but we can simplify later
                tags = tags.split(',').map(tag => tag.trim().toLowerCase());
                allPosts = allPosts.filter(post => post.topic_tags.some(tag => tags.includes(tag.toLowerCase())));
            }
            res.render('projects', {posts: allPosts});
        } catch (error) {
            console.error(error);
            res.status(500).render('error', {message: 'Internal server error'});
        }
    });

router.route('/:id')
    .get(isLoggedIn, async (req, res) => {
        // Display a specific project
        try {
            const projectId = idVal(req.params.id);
            const post = await getPostById(projectId);
            if (!post) {
                return res.status(404).render('error', {message: 'Project not found'});
            }
            res.render('projectDetails', {post: post});
        } catch (error) {
            console.error(error);
            res.status(500).render('error', {message: 'Internal server error'});
        }
    }).post(isLoggedIn, async (req, res) => {
        // Add a comment or join a project
        const projectId = req.params.id;
        const action = req.body.action;
        const content = req.body.content;
        try {
            projectId = idVal(projectId);
            action = stringVal(action);
            content = stringVal(content);
        } catch (error) {
            console.error(error);
            return res.status(400).json({message: error});
        }

        try {
            const post = await getPostById(projectId);
            const user = await getUserByUsername(stringVal(req.body.username));
            if (!post) {
                return res.status(404).render('error', {message: 'Project not found'});
            }
            if (!user) {
                return res.status(404).render('error', {message: 'User not found'});
            }
            if (action === 'comment') {
                await createComment(content, projectId, user._id);
                return res.status(200).json({message: 'Comment added successfully'});
            }
            else if (action === 'join') {
                // TODO
                // Implement join functionality
            } else {
                return res.status(400).render('error', {message: 'Invalid action'});
            }
        } catch (error) {
            console.error(error);
            res.status(500).render('error', {message: 'Internal server error'});
        }
    });

export default router;