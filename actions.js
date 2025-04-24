import { users } from "./config/mongoCollections.js";
import { get_auth_by_id } from "./data/authdata.js";
import { create_auth, try_auth } from "./src/lib/auth.js";
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
            const usersc = await users();
            const user = await usersc.findOne({"user_name": username});
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

        } break;

        /**
         * test creating user document
         */
        case "create_user": {

        } break;
    }
}