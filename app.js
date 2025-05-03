import express from "express";
import { constructorMethod } from "./routes/index.js";
import { settings } from "./src/settings.js";

const app = express();

async function Main() {
    // guys idk where in the code this should go in relation but
    // imma just put it here for now:

    // const db = await dbConnection();
    // await db.dropDatabase();

    constructorMethod(app);
    try {
        app.listen(settings.port, (e) => {
            if(typeof e === "undefined") {
                /**
                 * Server is running!
                 */
                // Anna updated: added the link right there in the print
                console.log(`Server running on: http://localhost:3000`);
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