import { create_auth } from "./src/lib/auth.js";
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
    }
}