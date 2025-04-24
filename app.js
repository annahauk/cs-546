import express from "express";
import { constructorMethod } from "./routes/index.js";
import { settings } from "./src/settings.js";
import { do_action } from "./actions.js";
import { exit } from "./src/util/common.js";

const app = express();

async function Main() {
    // guys idk where in the code this should go in relation but
    // imma just put it here for now:

    // const db = await dbConnection();
    // await db.dropDatabase();
    
    //get action if applicable
    let action;
    for(const arg in process.argv) {
        if(process.argv[arg] === "--action") {
            action = process.argv[arg+1];
        }
    }
    if(action) {
        await do_action(action);
        exit(0);
    }

    constructorMethod(app);
    try {
        app.listen(settings.port, (e) => {
            if(typeof e === "undefined") {
                /**
                 * Server is running!
                 */
                // Anna updated: added the link right there in the print
                console.log(`Server running on port: ${settings.port} http://localhost:3000`);
            } else {
                // error occured starting server :(
                failwith(`Failed to start server! ${e}`);
            }
        })
    } catch (e) {
        // fail to listen for server
        failwith(`Failed to start server! ${e}`);
    }
}

await Main();