import { users } from "./config/mongoCollections.js";
import { get_user_gh_token } from "./data/oauth.js";
import { add_project_member, create_project_application, get_project_application, getPostById, remove_project_applicaiton, remove_project_member } from "./data/posts.js";
import { getUserByUsername, createUser } from "./data/users.js";
import { create_auth, login, try_auth } from "./src/lib/auth.js";
import { GIT_Get_User_Info, GIT_Get_User_Langs, GIT_Get_User_Repos, set_user_gh_langs, set_user_github_info } from "./src/lib/git.js";
import { exit } from "./src/util/common.js";
import { writeFileSync } from "fs";

/**
 * FUNCTIONS FOR TESTING SPESIFIC FUNCTIONALITY OF THE APPLICATION
 * DO NOT USE THESE FUNCTIONS IN OTHER PARTS OF THE APP
 * 
 * use with --action <args>
 * yippee :3
 */
export async function do_action(action) {
    const argc = process.argv.length;
    const argv = process.argv;

    console.warn(`[WARN]: Performing manual action: ${action}!`);

    switch(action) {
        /**
         * test creating auth document for user
         */
        case "create_auth": {
            let username = argv[argc-2];
            let password = argv[argc-1];
            if(!username || !password) {
                console.error(`Usage: create_auth <username> <password>`);
                exit(1);
            }

            console.log(`Creating auth for ${username}`);
            const user = await getUserByUsername(username);
            if(!user) {
                console.log(`No user with username: ${username}.`);
                exit(1);
            }

            const authid = await create_auth(user._id, password);
            console.log(`created auth: ${authid}`);

            exit(0);
        } break;

        /**
         * testing auth tester
         */
        case "try_auth": {
            let username = argv[argc-2];
            let password = argv[argc-1];
            if(!username || !password) {
                console.error(`Usage: try_auth <username> <password>`);
                exit(1);
            }

            let authfast = true;
            setTimeout(() => {
                if(authfast) {
                    console.warn(`[WARN]: Auth was too fast <2000 ms! Did bcrypt work?`);
                }
            }, 2000);

            console.log(`Trying auth for ${username}`);
            const usersc = await users();
            const user = await usersc.findOne({"user_name": username});
            if(!user) {
                console.log(`No user with username: ${username}.`);
                exit(1);
            }

            if(await try_auth(user.Auth, password)) {
                console.log(`Auth success!`);
            } else {
                console.log(`Auth fail (bad credentials).`);
            }

            exit(0);
        } break;

        /**
         * testing user login
         */
        case "login": {
            let username = argv[argc-2];
            let password = argv[argc-1];
            if(!username || !password) {
                console.error(`Usage: login <username> <password>`);
                exit(1);
            }

            console.log(`Trying login for ${username}`);

            let token = await login(username, password);
            if(token) {
                console.log(`Login success! Added token`, token);
            } else {
                console.log(`Login failed (bad credentials).`);
            }

            exit(0);
        } break;

        /**
         * test creating user document
         */
        case "create_user": {
            const username =        argv[argc-2];
            const password =        argv[argc-1];

            let user;
            try {
                user = await createUser(username, password);
            } catch (e) {
                console.error(`Failed to create user`, e);
                exit(1);
            }

            console.log(user);
            exit(0);
        } break;

        case "gh_get_user": {
            const username = argv[argc-1];
            if(!username) {
                console.error(`Usage: gh_get_user <username>`);
                process.exit(1);
            }

            let user = await getUserByUsername(username);
            if(!user) {
                console.error(`No user found.`);
                process.exit(1);
            }

            let gh_token = await get_user_gh_token(user._id);
            if(!gh_token) {
                console.error(`User has no github token`);
                process.exit(1);
            }

            let res = await GIT_Get_User_Info(username, gh_token);
            console.log(res);
        } break;

        case "gh_get_user_repos": {
            const username = argv[argc-1];
            if(!username) {
                console.error(`Usage: gh_get_user_repos <username>`);
                process.exit(1);
            }

            let user = await getUserByUsername(username);
            if(!user) {
                console.error(`No user found.`);
                process.exit(1);
            }
            
            let gh_token = await get_user_gh_token(user._id);
            if(!gh_token) {
                console.error(`User has no github token`);
                process.exit(1);
            }

            let res = await GIT_Get_User_Repos(username, gh_token);
            console.log(res);
            writeFileSync("./test.json", JSON.stringify(res, null, 2));
        } break;

        case "gh_get_user_langs": {
            const username = argv[argc-1];
            if(!username) {
                console.error(`Usage: gh_get_user_repos <username>`);
                process.exit(1);
            }

            let user = await getUserByUsername(username);
            if(!user) {
                console.error(`No user found.`);
                process.exit(1);
            }
            
            let gh_token = await get_user_gh_token(user._id);
            if(!gh_token) {
                console.error(`User has no github token`);
                process.exit(1);
            }

            let res = await GIT_Get_User_Langs(username, gh_token);
            console.log(res);
        } break;

        case "gh_set_user_info": {
            const username = argv[argc-1];
            if(!username) {
                console.error(`Usage: set_user_gh_info <username>`);
                process.exit(1);
            }

            let user = await getUserByUsername(username);
            if(!user) {
                console.error(`No user found.`);
                process.exit(1);
            }

            let gh_token = await get_user_gh_token(user._id);
            if(!gh_token) {
                console.error(`User has no gh_token`);
                process.exit(1);
            }

            try {
                await set_user_github_info(username, gh_token);
                console.log("Success!");
            } catch (e) {
                console.error(e);
            }
        } break;

        case "gh_set_user_langs": {
            const username = argv[argc-1];
            if(!username) {
                console.error(`Usage: set_user_gh_info <username>`);
                process.exit(1);
            }

            let user = await getUserByUsername(username);
            if(!user) {
                console.error(`No user found.`);
                process.exit(1);
            }

            let gh_token = await get_user_gh_token(user._id);
            if(!gh_token) {
                console.error(`User has no gh_token`);
                process.exit(1);
            }

            try {
                let res = await set_user_gh_langs(username, gh_token);
                console.log(res);
            } catch (e) {
                console.error(e);
            }
        } break;

        case "join_project": {
            let post_id =   argv[argc - 3];
            let username =  argv[argc - 2];
            let text =      argv[argc - 1];

            if(!post_id || !username || !text) {
                console.error(`Usage: join_project <post_id> <username> <text>`);
                process.exit(1);
            }

            let user = await getUserByUsername(username);
            if(!user) {
                throw new Error(`No user`);
            }

            let post = await getPostById(post_id);

            try {
                console.log(await create_project_application(post, user, text))
            } catch(e) {
                console.error(e);
                process.exit(1);
            }
        } break;

        case "approve_project_application": {
            let post_id = argv[argc - 3];
            let app_id = argv[argc - 2];
            let text = argv[argc - 1];

            if(!post_id || !app_id || !text) {
                console.error(`Usage: <post_id> <app_id> <text>`);
                process.exit(1);
            }

            let post = await getPostById(post_id);
            let app = await get_project_application(post, app_id);
            if(!app) {
                throw new Error(`Application not found.`);
            }

            try {
                console.log(await remove_project_applicaiton(post, app, true, text));
                console.log(await await add_project_member(post, app.applicant_id));
            } catch (e) {
                console.error(e);
                process.exit(1);
            }
        } break;

        case "deny_project_application": {
            let post_id = argv[argc - 3];
            let app_id = argv[argc - 2];
            let text = argv[argc - 1];

            if(!post_id || !app_id || !text) {
                console.error(`Usage: <post_id> <app_id> <text>`);
                process.exit(1);
            }

            let post = await getPostById(post_id);
            let app = await get_project_application(post, app_id);
            if(!app) {
                throw new Error(`Application not found.`);
            }

            try {
                console.log(await remove_project_applicaiton(post, app, false, text));
            } catch (e) {
                console.error(e);
                process.exit(1);
            }
        } break;

        case "leave_project": {
            let post_id = argv[argc - 2];
            let username = argv[argc - 1];

            let user = await getUserByUsername(username);
            if(!user) {
                throw new Error(`No user`);
            }

            let post = await getPostById(post_id);

            try {
                console.log(await remove_project_member(post, user._id));
            } catch(e) {
                console.error(e);
                process.exit(1);
            }
        } break;

        default: {
            console.error(`Error: No action ${action}`);
            process.exit(1);
        }
    }
}