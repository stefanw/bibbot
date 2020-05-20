function restore() {
    browser.storage.sync.get({username: '', password: ''}).then(function(items) {
        var username = items.username;
        document.getElementById("username").value = username
        var password = items.password;
        document.getElementById("password").value = password
    })
}

function save(e) {
    e.preventDefault()
    var username = document.getElementById("username").value
    var password = document.getElementById("password").value
    browser.storage.sync.set({
        username: username,
        password: password,
    })
}

document.addEventListener("DOMContentLoaded", restore);
document.querySelector("form").addEventListener("submit", save)
