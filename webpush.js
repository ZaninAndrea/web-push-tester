self.addEventListener("push", async function(event) {
    const pushData = event.data.text()

    self.clients.matchAll().then(function(clients) {
        clients.forEach(function(client) {
            client.postMessage({
                message: pushData,
            })
        })
    })
})
