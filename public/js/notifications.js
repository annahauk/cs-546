document.addEventListener("DOMContentLoaded", async () => {
    // get all notification descision elements (forms)
    let descisionForms = [].slice.call(document.getElementsByClassName("notif-application-descision")); // list of all notification descision form elements as array
    
    for(const formElement of descisionForms) {
        // register events for each form
        // layout: first child ==> approve button, 2nd child ==> deny button, 3rd child ==> text field
        const referenceNotification = formElement.getAttribute  ("data-referenceNotification");
        const referenceProject = formElement.getAttribute       ("data-referenceProject");
        const referenceApplication = formElement.getAttribute   ("data-referenceApplication");
        const referenceFriendRequest = formElement.getAttribute ("data-referenceFriendRequest");
        const isFriendRequest = formElement.getAttribute        ("data-isFriendRequest");
        const approveButton = formElement.children[0];
        const denyButton = formElement.children[1];
        const text = formElement.children[2];
        console.log("text ", text)
        let textval = (text)? text.value.trim() : "No message provided.";
        console.log("textVal ", textval)
        if(!approveButton || !denyButton) {
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
            console.log(`Approved application: ${referenceApplication}, message: ${textval}`);
            e.preventDefault();
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
                        "text": textval
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
            console.log(`Denied application: ${referenceApplication}, message: ${textval}`);

            let url;
            if(isFriendRequest) {
                url = `/profile/friendDeny/${referenceFriendRequest}`
            } else {
                url = `/projects/${referenceProject}/join/${referenceApplication}/deny`;
            }

            const res = await fetch(
                url,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    "body": JSON.stringify({
                        "text": textval
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