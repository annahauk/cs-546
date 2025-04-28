export class TokenCache {
    // TODO: switch back to private
    lookup;

    constructor() {
        this.lookup = {};
    }

    /**
     * push token to cache
     * @param username 
     * @param token 
     * @returns 
     */
    async push_token(username, token, lifetime) {
        if(typeof this.lookup[username] === "undefined") {
            // define
            this.lookup[username] = [token];
            return;
        }

        this.lookup[username].push(token);

        // set lifetime
        setTimeout(async () => {
            await this.remove_token(username, token.content);
        }, lifetime);
    }

    /**
     * remove token from thingamajig
     * @param username 
     * @param token 
     */
    async remove_token(username, token_content) {
        if(typeof this.lookup[username] === "undefined") {
            return;
        }

        this.lookup[username] = this.lookup[username].filter((t) => {
            return t.content !== token_content;
        })
    }

    /**
     * cache has token - returns token from cache
     * @param username 
     * @param token 
     */
    async has_token(username, token_content) {
        if(typeof this.lookup[username] === "undefined") {
            return false;
        }

        for(const t of this.lookup[username]) {
            if(t.content === token_content) {
                return t;
            }
        }

        return null;
    }

     async debug_print_cache() {
        console.log(this.lookup);
    }
}