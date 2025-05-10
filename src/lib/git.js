import { OktoCache } from "./okto_cache.js";

const OKTO_CAHCE = new OktoCache();
const X_GITHUB_API_VERSION = "2022-11-28";

export async function GIT_Get_User_Info(username, ghtoken) {
    const okt = await OKTO_CAHCE.get(username, ghtoken);
    return await okt.okto.request(`GET /user`, {"headers": {
        "X-GitHub-Api-Version": X_GITHUB_API_VERSION
    }})
}