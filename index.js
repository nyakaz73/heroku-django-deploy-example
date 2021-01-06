const core = require('@actions/core');
const { execSync } = require('child_process');

//Variables
let heroku = {
    'app_name': core.getInput('heroku_app_name'),
    'api_key': core.getInput('heroku_api_key'),
    'email_address': core.getInput('heroku_email_address'),
    'workingDir': core.getInput('working_directory'),
}

let execOptions = {
    cwd: heroku.workingDir,
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
        console.log(user);
        console.log(`Succeffully logged with user ${user}`);
    } catch (error) {
        console.log(error.message);
        core.setFailed(error.message);
    }
}


deployToHeroku = ({ app_name }) => {
    try {
        console.log('***************************');
        console.log('--Login--')
        console.log('***************************');

        const login = execSync('heroku container:login').toString();
        console.log(login);

        //Build and Push the Image to CR
        console.log('***************************');
        console.log('--Build and Push Image--')
        console.log('***************************');
        const build_push = execSync(`heroku container:push --app ${app_name} web`, execOptions).toString();
        console.log(build_push)

        //App Migration
        console.log('***************************');
        console.log('--App Migration--')
        console.log('***************************');
        const migrate = execSync('heroku run python manage.py migrate', execOptions).toString();
        console.log(migrate);

        //Releasing the app
        console.log('***************************');
        console.log('--Releasing the app--')
        console.log('***************************');
        const release = execSync(`heroku container:release --app ${app_name} web`, execOptions).toString();
        console.log(release);


    } catch (error) {
        console.log(error.message);
        core.setFailed(error.message);
    }
}


//Calls
login();
deployToHeroku(heroku);


//Set output
core.setOutput(
    "status",
    "Successfully Signed In"
);

