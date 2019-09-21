const webpush = require("web-push")
const vapidKeys = webpush.generateVAPIDKeys()
document.getElementById("publicKey").value = vapidKeys.publicKey

navigator.serviceWorker.onmessage = function(event) {
    let data = event.data.message
    let text = JSON.stringify(JSON.parse(data), null, 2)

    document.getElementById("receivedNotifications").innerHTML +=
        "<pre><code>" + text + "</code></pre>"
}

async function main() {
    const swReg = await navigator.serviceWorker.register("webpush.js")

    window.setupWebPush = () => {
        const applicationServerPublicKey = document.getElementById("publicKey")
            .value

        function urlB64ToUint8Array(base64String) {
            const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
            const base64 = (base64String + padding)
                .replace(/-/g, "+")
                .replace(/_/g, "/")

            const rawData = window.atob(base64)
            const outputArray = new Uint8Array(rawData.length)

            for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i)
            }
            return outputArray
        }

        const applicationServerKey = urlB64ToUint8Array(
            applicationServerPublicKey
        )
        swReg.pushManager
            .subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey,
            })
            .then(readSubscription)
    }

    // function sendSubscriptionToServer(subscription) {
    //     // the server URL changes based on whether the server setting is set to auto or manual
    //     const serverUrl = `https://bering.igloo.ooo/web-push-subscribe`

    //     fetch(serverUrl, {
    //         body: JSON.stringify(subscription),
    //         cache: "no-cache",
    //         credentials: "same-origin",
    //         headers: {
    //             "user-agent": "Mozilla/4.0 MDN Example",
    //             "content-type": "application/json",
    //             authorization: "Bearer " + token,
    //         },
    //         method: "POST",
    //         mode: "cors",
    //         redirect: "follow",
    //         referrer: "no-referrer",
    //     })
    // }

    async function readPermission() {
        document.getElementById(
            "state"
        ).innerHTML = await swReg.pushManager.permissionState({
            userVisibleOnly: true,
        })
    }
    readPermission()

    async function readSubscription() {
        const subscription = await swReg.pushManager.getSubscription()

        let text = subscription
            ? JSON.stringify(subscription, null, 2)
            : "No subscription registered"

        document.getElementById("registration").innerHTML = text
    }
    readSubscription()

    window.unregisterWebPush = async function() {
        const subscription = await swReg.pushManager.getSubscription()

        if (!subscription) return

        await subscription.unsubscribe()
        await readSubscription()
    }

    window.unregisterWebPush().then(window.setupWebPush)

    navigator.permissions
        .query({ name: "notifications" })
        .then(function(notificationPerm) {
            notificationPerm.onchange = readPermission
        })

    window.addEventListener("message", console.log, false)
}

main()

window.clearNotifications = function() {
    document.getElementById("receivedNotifications").innerHTML = ""
}
