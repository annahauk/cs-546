import { xss } from "../../helpers.js";

export async function Xss(req,res,next) {
    /**
     * sanitize cookie inputs
     */
    if(req.cookies) {
        const cookie_keys = Object.keys(req.cookies);
        for(const key of cookie_keys) {
            req.cookies[key] = xss(req.cookies[key]);
        }
    }

    /**
     * sanitize body inputs
     */
    if(req.body) {
        const bodykeys = Object.keys(req.body);
        req.body["UNSANITIZED"] = {...req.body};
        for(const key of bodykeys) {
            req.body[key] = xss(req.body[key]);
        }
    }

    next();
}