import { Octokit } from "octokit";

export class OktoCache {
    // TODO: switch back to private
    lookup;

    constructor() {
        this.lookup = {};
    }

    /**
     * cache has token - returns token from cache
     * @param {string} username 
     * @param {string} token_content 
     */
    async get(username, token) {
        async function _create(that, username, token) {
            that.lookup[username] = {
                token: token,
                okto: new Octokit({
                    "auth": token,
                    "userAgent": "gitmatches/0.0.1"
                })
            };

            return that.lookup[username];
        }

        // if oktokit not defined, then create it, else return
        if(typeof this.lookup[username] === "undefined") {
            return await _create(this, username, token);
        }
        // if token missmatch, rebuild oktokit
        if(this.lookup[username].token !== token) {
            return await _create(this, username, token);
        }
        // return object
        return this.lookup[username];
    }

     async debug_print_cache() {
        console.log(this.lookup);
    }
}