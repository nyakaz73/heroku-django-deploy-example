const core = require('@actions/core');
const { execSync } = require('child_process');

//Variables
let heroku = {
    'app_name': core.getInput('heroku_app_name'),
    'api_key': core.getInput('heroku_api_key'),
    'email_address': core.getInput('heroku_email_address'),
}

const createNetrcFileForLogin = ({ email_address, api_key }) => {
    return execSync(`cat >~/.netrc << EOF
machine api.heroku.com
  login ${email_address}
  password ${api_key}
machine git.heroku.com
  login ${email_address}
  password ${api_key}
    `);
}


login = () => {
    try {
        createNetrcFileForLogin(heroku);
        const user = execSync('heroku auth:whoami').toString();
        console.log(`Succeffully logged with user ${user}`);
    } catch (error) {
        console.log(error.message);
        core.setFailed(error.message);
    }
}




//Calls
login();


//Set output
core.setOutput(
    "status",
    "Successfully Logged"
);

