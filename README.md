# Yaxys – yet another access control system
## Installation
1. Download the app
1. Create PostgreSQL database instance
1. Put the database requisites into `/config/local.json` file, under the key "db" (see the example at `config/default.json`)
1. Run `yarn install`
1. Run `yarn init_db` to create all the required tables in your db
1. Run `yarn create_operator --login somebody --pwd 1234`
1. Run `yarn dev` and go to http://localhost:5000

## Settings

We store application settings in a _settings_ section in our configuration file `/config/default.json`.
By default, it looks like this:

```
  "settings": {
    "paginationLimit": 20,
    "hideDoors": false,
    "hideZones": false,
    "singleCredential": false
  }
```

You can redefine them by putting new values into `/config/local.json`.

### `paginationLimit`
How many items to show in entity tables.

### `hideDoors`
If `true`, the app will completely hide the doors from the interface.
You'll be able to operate just with Access Points and zones (if `hideZones` is still `false`)

### `hideZones`
If `true`, the app will completely hide the zones from the interface.
You'll be able to operate just with Access Points and doors (if `hideDoors` is still `false`).

You can set both of these options to `false` – in such case, the operators will be able to use just Access Points

### `singleCredential`

By default, one user can have many credentials. At user's page, you see the credential list where you can
add, modify and remove them.

If you set `singleCredential` to `true`, every user will show just one credential.
The credential code will become a simple user attribute.

That is just a client-side feature. At server-side you still can have many credentials.
So, if you create multiple credentials for one user, then set `singleCredential` to `true`, the data won't be lost.
After returning `singleCredential` back to `false`, you'll see all of the old credentials.


