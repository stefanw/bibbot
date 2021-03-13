var defaults = {
    installDate: null,
    username: '', password: '',
    keepStats: true,
    stats: {}
}

function restore() {
    browser.storage.sync.get(defaults).then(function(items) {
        document.getElementById("username").value = items.username
        document.getElementById("password").value = items.password
        document.getElementById("keepStats").checked = items.keepStats

        if (items.installDate === null) {
            // first run
            browser.storage.sync.set({
                installDate: new Date().getTime()
            })
            document.querySelector('#setup').setAttribute('open', true)
        }
    })
    fetch('/manifest.json').then(response => response.json())
    .then(data => {
        var domains = data.content_scripts[0].matches.map(url => url.replace('https://', '').replace('/*', ''))
        var ul = document.getElementById('newssites')
        domains.forEach(domain => {
            var li = document.createElement('li')
            li.innerText = domain
            ul.appendChild(li)
        });
    });
}

function save() {
    var username = document.getElementById("username").value
    var password = document.getElementById("password").value
    var keepStats = document.getElementById("keepStats").checked

    const values = {
        username: username,
        password: password,
        keepStats: keepStats
    }
    if (!keepStats) {
        values.stats = {}
    }

    browser.storage.sync.set(values)
}

var allInputs = document.querySelectorAll('input')
for (var i = 0; i < allInputs.length; i += 1) {
    allInputs[i].addEventListener('input', save)
    allInputs[i].addEventListener('change', save)
}
document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault()
    save()
})

document.addEventListener("DOMContentLoaded", restore);
