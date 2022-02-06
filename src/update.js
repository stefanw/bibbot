export default {
  run_update: function (previousVersion, currentVersion) {
    if (previousVersion <= '0.11.0') {
      // Storage of user options now is provider dependent
      // Move the options for VOEBB to provider specific storage
      console.log('Update from < 0.12.0 - Changing from user options to provider dependent user options')

      const defaults = {
        username: null,
        password: null
      }

      browser.storage.sync.get(defaults).then((items) => {
        if (items.username && items.password) {
          console.log('Found credentials')

          const newStorage = {
            providerOptions: {}
          }

          newStorage.providerOptions['voebb.de.options.username'] = items.username
          newStorage.providerOptions['voebb.de.options.password'] = items.password
          browser.storage.sync.set(newStorage)
            .catch((e) => console.log('Failes to save new entries to storage:', e))
          browser.storage.sync.remove(['username', 'password'])
            .catch((e) => console.log('Failed to remove old entries:', e))
        } else {
          console.log("There isn't any username or any password set, skipping")
        }
      }, (e) => console.log('Failed to fetch old credentials:', e))
    }
  }
}
