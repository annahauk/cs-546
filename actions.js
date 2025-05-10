import { users } from "./config/mongoCollections.js";
import { get_user_gh_token } from "./data/oauth.js";
import { getUserByUsername, createUser } from "./data/users.js";
import { create_auth, login, try_auth } from "./src/lib/auth.js";
import { GIT_Get_User_Info } from "./src/lib/git.js";
import { exit } from "./src/util/common.js";

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

            let gh_token = await get_user_gh_token((await getUserByUsername(username))._id);
            console.log(await GIT_Get_User_Info(username, gh_token));
        }
    }
}