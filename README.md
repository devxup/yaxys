# Yaxys – yet another access control system

## Requirements

* Node >= 10.0.0
* PostgreSQL >= 9.6.0

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

## Webhooks

You can set up the webhook to notify other software every time the Access control system configuration has changed.
The hook is performde every time when one of the following entites added, updated or deleted:
* Access point
* Door
* Zone
* Access right of user or user profile
* User
* Credential
* User profile
* User-profile binding (e.g. user attached to some profile so got some additional access rights)

To set up the webhook, provide an object with options under the `webhook` of your config file.
Here is an example:
```
  "webhook": {
    "url": "https://your-domain.com/api/some_path?from=yaxys",
    "method": "POST",
    "additionalGetParameters": { "another_param": 1},
    "responseBodySizeLimit": 1000
  }
```

* `url` – the URL in any acceptable form. Can contain GET-parameters;
* `method` – HTTP request method, one of the `GET`, `POST`, `PUT` or `DELETE`;
* `additionalGetParameters` – another way to provide GET-parameters
* `responseBodySizeLimit` – in case of wrong response (status code is not `2xx`), Yaxys will display response body in the terminal. By this option you can limit the size of this information.

Additionally, yaxys will attach the following GET-parameters to the request URL:
* `entity` – the name of the entity, which triggered webhook;
* `id` – the `id` of that entity instance;
* `verb` – one of `create`, `update`, or `delete`. Describes what exactly happened with the entity.

## API

All of the yaxys entities are available via standard RESTful API, e.g.:

* `GET /api/accesspoint?zoneTo=1` – get all of the Access Points leading to Zone #1
* `GET /api/accesspoint/23` – get the Access Point #23


Additionally, for numeric and datetime fields, you can set predicate filters. Currently Yaxys supports only `>`, `<`, `<=`, `>=`, `<>` predicates.
To use filter, you shopuld prefix filter value with the predicate and the colon `:` after it:


* `GET /api/accesspoint?zoneTo=>:7` – get all of the Access Points having zoneTo #7 (predicate `>`);
* `GET /api/accesspoint?updatedAt=<:some_iso_formatted_date` – get all of the Access Points updated earlier than provided date;
* `GET /api/accesspoint?updatedAt=<=:some_iso_formatted_date` – get all of the Access Points updated exactly at provided date or earlier;

### Access rights API

Your software can programmatically get Access Rights information using two ways:

1. `GET /api/accesspoint/{HERE_GOES_ACCESS_POINT_ID}/access - get all of the credentials which have access for given access point
1. `GET /api/credential/{HERE_GOES_CREDENTIAL_CODE}/access - get all of the access points for which given credential has access

In both cases, you'll get an array of such structures
```
{
  "credentialCode": "12345678",
  "credentialId": 1,
  "accessPoint": 2,
  "accessRight": 2
}
```

The `accessRight` is the id of AccessRight entity in the yaxys db. It can be used to track why this specific access is granted.

### API authentication

All of the API, including standard RESTful requests to entities and Access rights API, are protected and unavailable for non-authenticated users.
There are two ways of authentication:
* Standard JWT way used by browser client application.
* HMAC signature of requests – much more suitable for working with external API.

> The second way should be preferred when working with Yaxys from external software, but you still can use
JWT authentication – create fake operator, authenticate, get JWT token and send it in the cookie with every signle request.

To authenticate via HMAC, you should provide two additional parameters with every request:
* `timestamp` - your request timestamp value in milliseconds
* `signature` - HMAC-signature of the request path (including all GET-parameters except `timestamp` and not including host). The `signature` should be the last GET-parameter of your request..

First, Yaxys will ensure that your timestamp is affordable (using `hmac.affordableTimestampLag` config value in milliseconds).
Then, it will calculate the request signature and compare with one provided in GET-parameter. If they are the same, the Yaxys
will authenticate the request and grant the administrator rights to it.

Of course, to generate correct signature, you should have the same secret at yaxys side (config `hmac.secret`) and at your software
request side. Another configuration option is `hmac.algorithm`, which is `sha256` by default, but you can change it into any other
appropriate value.

To generate HMAC signature, Yaxys is using standard [Crypto module](https://nodejs.org/api/crypto.html#crypto_class_hmac) of the Node.js.

Here's the example of how the signing procedure can look at your side:

```
const crypto = require("crypto")

const getSignedRequestPath = (pathname) => {
  const timestamp = new Date().getTime()
  const pathnameToSign = `${pathname}?timestamp=${timestamp}`

  const hmac = crypto.createHmac("sha256", "YOUR_SECRET")
  hmac.update(pathnameToSign)
  const signature = hmac.digest("hex")

  return `${pathnameToSign}&signature=${signature}`
}

const url = `https://YAXYS_INSTANCE_DOMAIN/${getSignedRequestPath("/api/accesspoint/1/access")}`
// todo: request url

```





