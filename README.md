# Sistema

## Setup

- [ ]  Make sure you have been added to the [UW Blueprint Github Workspace](https://github.com/uwblueprint/).
- [ ]  Install Docker Desktop ([MacOS](https://docs.docker.com/docker-for-mac/install/) | [Windows](https://docs.docker.com/desktop/install/windows-install/) | [Linux](https://docs.docker.com/engine/install/#server)) and ensure that it is running.
- [ ]  Install [node](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).
- [ ]  Install [yarn](https://classic.yarnpkg.com/lang/en/docs/install/).
- [ ]  Install nvm ([MacOS](https://medium.com/@priscillashamin/how-to-install-and-configure-nvm-on-mac-os-43e3366c75a6) | [Windows](https://github.com/coreybutler/nvm-windows#readme)) and run the commands below in your terminal.

    ```bash
    nvm install 20.14.0
    nvm use 20.14.0
    ```

- [ ]  Clone the [Sistema Github Repository](https://github.com/uwblueprint/sistema) to your local machine and `cd` into the project folder:

    ```bash
    git clone https://github.com/uwblueprint/sistema.git
    cd sistema
    ```

- [ ]  Install [Vault](https://www.notion.so/Secret-Management-2d5b59ef0987415e93ec951ce05bf03e?pvs=21) in order to pull secrets
  - [ ]  You **do not** need to do “configure dev tools for your project repo”
  - [ ]  Run `vault kv get -format=json kv/sistemaw | python update_secret_files.py` to pull Secrets and you should see one `.env` file in the root directory, and one in the frontend directory
