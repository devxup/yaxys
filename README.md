# Yaxys – yet another access control system
## Installation
1. Download the app
1. Create PostgreSQL database instance
1. Put the database requisites into `/config/local.json` file, under the key "db" (see the example at `config/default.json`)
1. Run `yarn install`
1. Run `yarn init_db` to create all the required tables in your db
1. Run `yarn create_operator --login somebody --pwd 1234`
1. Run `yarn dev` and go to http://localhost:5000
