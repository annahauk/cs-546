document.addEventListener("DOMContentLoaded", async () => {
    // get all notification descision elements (forms)
    let descisionForms = [].slice.call(document.getElementsByClassName("notif-application-descision")); // list of all notification descision form elements as array
    
    for(const formElement of descisionForms) {
        // register events for each form
        // layout: first child ==> approve button, 2nd child ==> deny button, 3rd child ==> text field
        const referenceNotification = formElement.getAttribute("referenceNotification");
        const referenceProject = formElement.getAttribute("referenceProject");
        const referenceApplication = formElement.getAttribute("referenceApplication");
        const referenceFriendRequest = formElement.getAttribute("referenceFriendRequest");
        const isFriendRequest = formElement.getAttribute("isFriendRequest");
        const approveButton = formElement.children[0];
        const denyButton = formElement.children[1];
        const text = formElement.children[2];

        if(!approveButton || !denyButton || !text) {
            console.error(approveButton, denyButton, text);
            throw new Error(`Descision form missing elements`);
        }

        console.log(`register application form: ref project ==> ${referenceProject}, ref app ==> ${referenceApplication}`);
        console.log(`is friend request: ${isFriendRequest}`, referenceFriendRequest);

        // prevent default behavior of form
        formElement.addEventListener("submit", async (e) => {
            e.preventDefault();
        })

        // register buttons
        // approve
        approveButton.addEventListener("click", async(e) => {
            console.log(`Approved application: ${referenceApplication}, message: ${text.value.trim()}`);

            // diff between application types
            let url;
            if(isFriendRequest) {
                url = `/profile/friendAccept/${referenceFriendRequest}`;
            } else {
                url = `/projects/${referenceProject}/join/${referenceApplication}/approve`;
            }

            const res = await fetch(
                url,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    "body": JSON.stringify({
                        "text": text.value.trim()
                    })
                }
            );
            if(res.status !== 200) {
                throw new Error(`Approve route returned bad response code: ${url}`);
            }
            await _resolve();
        });

        // deny
        denyButton.addEventListener("click", async(e) => {
            console.log(`Denied application: ${referenceApplication}, message: ${text.value.trim()}`);

            let url;
            if(isFriendRequest) {
                url = `/profile/friend`
            }

            const res = await fetch(
                url,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    "body": JSON.stringify({
                        "text": text.value.trim()
                    })
                }
            );
            if(res.status !== 200) {
                throw new Error(`Approve route returned bad response code: ${url}`);
            }
            await _resolve();
        });

        // resolve notification function
        async function _resolve() {
            console.log(`Marking ${referenceApplication} as resolved.`);
            const res = await fetch(
                `/notifications/resolve/${referenceNotification}`,
                {
                    "method": "POST"
                }
            );
            if(res.status !== 200) {
                throw new Error(`Failed to resolve ${referenceApplication}`);
            }
            window.location.reload();
        }
    }
})