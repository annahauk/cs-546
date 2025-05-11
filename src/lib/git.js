import { users } from "../../config/mongoCollections.js";
import { getUserByUsername } from "../../data/users.js";
import { OktoCache } from "./okto_cache.js";

const OKTO_CAHCE = new OktoCache();
const X_GITHUB_API_VERSION = "2022-11-28";

/** @typedef {import("@octokit/openapi-types").components["schemas"]["private-user"]} GitHubUser */
/** @typedef {import("@octokit/openapi-types").components["schemas"]["minimal-repository"]} GitMinimalRepository */

/**
 * get user info from github
 * @param {string} username 
 * @param {string} ghtoken 
 * @returns {Promise<import("@octokit/types").OctokitResponse<GitHubUser>>}
 */
export async function GIT_Get_User_Info(username, ghtoken) {
    const okt = await OKTO_CAHCE.get(username, ghtoken);
    return await okt.okto.request(`GET /user`, {"headers": {
        "X-GitHub-Api-Version": X_GITHUB_API_VERSION
    }});
}

/**
 * 
 * @param {string} username 
 * @param {string} ghtoken 
 * @returns 
 */
export async function set_user_github_info(username, ghtoken) {
    let user = await getUserByUsername(username);
    if(!user) {
        throw new Error(`User not found.`);
    }

    let gh_info = await GIT_Get_User_Info(username, ghtoken);
    if(!gh_info) {
        throw new Error(`Failed to retrieve github user profile info.`);
    }

    // insert user github info
    const usersc = await users();
    let res = await usersc.updateOne({_id: user._id}, {"$set": {"gh_info": gh_info}});
    if(!res.acknowledged) {
        throw new Error(`Upsert failed.`);
    }

    return;
}

/**
 * 
 * @param {string} username 
 * @param {string} gh_token 
 * @returns {Promise<import("@octokit/types").OctokitResponse<Array<GitMinimalRepository>>}
 */
export async function GIT_Get_User_Repos(username, gh_token) {
    // GET /users/{username}/repos
    let kt = await OKTO_CAHCE.get(username, gh_token);

    let user = await getUserByUsername(username);
    if(!user) {
        throw new Error(`User not found`);
    }

    if(!user.gh_info) {
        throw new Error(`User has no github info`);
    }

    return await kt.okto.request(`GET /users/{username}/repos`, {
        "username": user.gh_info.data.login,
        "headers": {
            "X-GitHub-Api-Version": X_GITHUB_API_VERSION
        }
    })
}

/**
 * 
 * @param {string} username 
 * @param {string} gh_token 
 * @param {(undefined|Array<GitMinimalRepository>)} _repos 
 * @returns 
 */
export async function GIT_Get_User_Langs(username, gh_token, _repos) {
    let repos;
    if(!_repos) {
        repos = await GIT_Get_User_Repos(username, gh_token);
    } else {
        repos = _repos;
    }

    if(repos.data.length < 1) {
        throw new Error(`User has no repositories.`);
    }

    let langs = Array.from(
        new Set(
            repos.data.map((repo) => {return repo.language})
            .filter((tag) => {return tag !== null})
        )
    )

    if(langs.length < 1) {
        throw new Error(`No languages detected.`);
    }

    return langs;
}