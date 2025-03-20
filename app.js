import express from "express";
import { constructorMethod } from "./routes/index.js";
import { settings } from "./src/settings.js";

const app = express();

async function Main() {
    constructorMethod(app);
    try {
        app.listen(settings.port, (e) => {
            if(typeof e === "undefined") {
                /**
                 * Server is running!
                 */
                console.log(`Server running on port: ${settings.port}`);
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