//minimum length values
const MIN_NAME_LENGTH = 2;
const MIN_PIN_LENGTH = 4;

//PIN restriction regex (identify bad PINs)
const pin_regex = /\D/;
//Username restriction regex (identify bad Usernames)
const name_regex = /[^\w-]/;

/**
 * gets the current session storage,
 * lasts as long as the tab or the browser is open
 * survives between reloads
 * -new tabs or closing it will refresh the session
 */

//store current page state
let loginState;

//"settings" object retrieved from backend/storage
let settingObj;

//username box
let usernameField = document.getElementById('username');

//password box
let passwordField = document.getElementById('pin');

//password require message
var message = document.getElementById('message');
//password/username error message
var errP = document.getElementById('errorP');

//make the login button redirect to Index
let loginButton = document.getElementById('login-button');
loginButton.addEventListener('click', () => {
    console.log((loginState == 'new'));
    if (loginState == 'new') {
    message.style.display = 'block';
    validFormat();
    }
    
    handleLoginButton();
});
// window.addEventListener("keydown", (e) => {
//     if(e.key == 'Enter'){
//         if(document.activeElement != resetPasswordButton) {
//             loginButton.click();
//         } else {
//             resetPasswordButton.click();
//         }
//     }

// })
// make the reset-password-button redirect to Index
let resetPasswordButton = document.getElementById('reset-password-button');
resetPasswordButton.addEventListener('click', () => {
    message.style.display = 'block';
    validFormat();
    handleResetPassword();
});

window.addEventListener('keydown', (e) => {
    if (e.key == 'Enter') {
        if (document.activeElement != resetPasswordButton) {
            loginButton.click();
        } else {
            resetPasswordButton.click();
        }
    }
});
window.onload = getLoginState();

// function determineUserState(state) {
//     if (state == 'returning') {
//         handleLogin(passwordField.value);
//     } else if (state == 'new') {
//         handleSignup(usernameField.value.trim(), passwordField.value.trim());
//     }
// }

/**
 * Connects to the database, and sees if
 * the user is new or returning
 */
function getLoginState() {
    // eslint-disable-next-line no-undef
    let dbPromise = initDB();
    dbPromise.onsuccess = function (e) {
        // eslint-disable-next-line no-undef
        setDB(e.target.result);
        // eslint-disable-next-line no-undef
        let req = getSettings();
        req.onsuccess = function (e) {
            //console.log('got settings');
            console.log(e.target.result);
            settingObj = e.target.result;
            if (settingObj === undefined) {
                loginState = 'new';
                setNewUser();
            } else {
                loginState = 'returning';
                setReturningUser();
            }
        };
    };
}

passwordField.onfocus = function () {
    console.log('12345');
    message.style.display = 'block';
    passwordField.classList.add('clicking');
};

passwordField.onblur = function () {
    passwordField.classList.remove('clicking');
};

passwordField.onfocus = function () {
    passwordField.classList.add('clicking');
};

usernameField.onfocus = function () {
    usernameField.classList.add('clicking');
};

usernameField.onblur = function () {
    usernameField.classList.remove('clicking');
};
// if (loginState = 'new') {
//     passwordField.onfocus = function () {
//     document.getElementById('message').style.display = 'block';
//     passwordField.classList.add('clicking');
//     validFormat();
//     };
// }

/**
 * handle the login button functionalities
 */
function handleLoginButton() {
    if (loginState == 'returning') {
        handleLogin(passwordField.value);
    } else if (loginState == 'new') {
        handleSignup(usernameField.value, passwordField.value);
    }
}

/**
 * Handle a Sign-Up request from a new user
 *
 * @param {String} newUsername Display name of new user
 * @param {String} newPassword PIN of new user
 */
function handleSignup(newUsername, newPassword) {
    //call helper to check if inputs are valid
    validFormat();
    if (verifyValidInputs(newUsername, newPassword)) {
        //if so, proceed
        let userObject = {
            username: newUsername,
            password: newPassword,
            theme: '#d4ffd4',
        };

        //update settings
        // eslint-disable-next-line no-undef
        updateSettings(userObject);

        //automatically log in
        sessionStorage.setItem('loggedIn', 'true');
        goHome();
    }
}

/**
 * handle reset password functionaliy of the associated
 */
function handleResetPassword() {
    resetPasswordButton.innerHTML = 'Comfirm';
    resetPasswordButton.addEventListener('click', () => {
        //loginButton.removeEventListener('click', handleLoginButton);
    
            // update settings
            if (verifyValidInputs(settingObj.username, passwordField.value)) {
                let userObject = {
                    username: settingObj.username,
                    password: passwordField.value,
                    theme: '#d4ffd4',
                };
                // eslint-disable-next-line no-undef
                updateSettings(userObject);
                settingObj.password = passwordField.value;

                // log the user in
                sessionStorage.setItem('loggedIn', 'true');
                goHome();
            }
    });
}

/*function verifyValidInputs(newUsername, newPassword){
 * Helper function called from handleSignup()
 * Checks that username and PIN comply with length requirements and don't contain prohibited characters.
 * @param {String} newUsername Username to check
 * @param {String} newPassword password to check
 */
function verifyValidInputs(newUsername, newPassword) {
    var errU = document.getElementById('errorU');

    //prohibit empty username
    if (newUsername.length == 0) {
        errU.textContent = 'Please provide a username';
        //passwordField.style.border = "1px solid Red";  
        usernameField.style.border = "1px solid Red";  
        errU.style.display = 'block';
        return false;
    }
    //prohibit short names
    else if (newUsername.length < MIN_NAME_LENGTH) {
        errU.textContent = 'Username must be at least 2 characters long';
        errU.style.display = 'block';
        usernameField.style.border = "1px solid Red";  
        return false;
    }
    //prohibit invalid characters in username
    else if (name_regex.test(newUsername)) {
        errU.textContent = 'Username must not contain special characters';
        errU.style.display = 'block';
        usernameField.style.border = "1px solid Red";  

        return false;
    }
    

    //prohibit short passwords
    else if (newPassword.length < MIN_PIN_LENGTH) {
        errU.style.display = 'none';
        errP.textContent = 'PIN must be at least 4 digits long';
        errP.style.display = 'block';
        usernameField.style.border = ''
        passwordField.style.border = "1px solid Red";  
        return false;
    }
    //prohibit non-numeric PIN
    else if (pin_regex.test(newPassword)) {
        errU.style.display = 'none';
        errP.textContent = 'PIN must contain numbers only';
        errP.style.display = 'block';
        usernameField.style.border = ''
        passwordField.style.border = "1px solid Red";  
        return false;
    }

    //allow otherwise
    else {
        return true;
    }
}

function validFormat() {
    // var myInput = document.getElementById('pin');
    var length = document.getElementById('length');
    var number = document.getElementById('number');
    var letter = document.getElementById('letter');
    // When the user clicks on the password field, show the message box
    // passwordField.onfocus = function () {
    //     document.getElementById('message').style.display = 'block';
    // };

    // When the user clicks outside of the password field, hide the message box
    // passwordField.onblur = function () {
    //     document.getElementById('message').style.display = 'none';
    // };

    
    // When the user starts to type something inside the password field
    passwordField.onkeyup = function () {
        if (passwordField.value.length >= 4) {
            length.classList.remove('invalid');
            length.classList.add('valid');
        } else {
            length.classList.remove('valid');
            length.classList.add('invalid');
        }
    
        //var numbers = /[0-9]/g;
            if (pin_regex.test(passwordField.value)) {
                number.classList.remove('valid');
                number.classList.add('invalid');
                letter.classList.remove('valid');
                letter.classList.add('invalid');
            } else {
                number.classList.remove('invalid');
                number.classList.add('valid');
                letter.classList.remove('invalid');
                letter.classList.add('valid');
            }
    };
}

/**
 * Handles Login request. Checks if password hash is correct, and if so, goes to index
 * (Password is "dinosaurs12")
 * Begins to handle the Login request. Checks sends the password hash to be verified.
 *
 * @param {String} password : PIN to be verified
 */
function handleLogin(password) {
    let correctPassword = settingObj.password;
    if (correctPassword === password) {
        //set login flag that user logged in
        // eslint-disable-next-line no-undef
        //passwordField.style.border = "";  
        sessionStorage.setItem('loggedIn', 'true');
        goHome();
    } else {
        errP.textContent = 'Incorrect password!';
        passwordField.style.border = "1px solid Red";  
        errP.style.display = "block";
    }
}

/**
 * Redirect the browser to the Index page with a href
 */
function goHome() {
    window.location.href = '../Index/Index.html';
}
/**
 * Change the login screen to the "New User" mode
 * Hide username, update text.
 */
function setNewUser() {
    resetPasswordButton.setAttribute('hidden', 'hidden');
    document.getElementById('username').style.display = 'flex';
    document.getElementById('title').innerText = 'Create your login!';
    loginButton.innerText = 'Sign Up';
}

/**
 * Change the login screen to the "Returning User" mode
 * Show username, update text
 */
function setReturningUser() {
    resetPasswordButton.removeAttribute('hidden');
    document.getElementById('username').style.display = 'none';
    document.getElementById('US').innerHTML = '';

    document.getElementById('title').innerText = 'Welcome back!';
    loginButton.innerText = 'Sign In';
}

function hide() {
    document.getElementById('message').style.display = 'none';
}
