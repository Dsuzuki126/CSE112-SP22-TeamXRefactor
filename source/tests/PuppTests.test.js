/* eslint-disable no-undef*/

//const { loadPartialConfigAsync } = require('@babel/core');

/*//sample puppeteer test
describe('Google', () => {
    beforeAll(async () => {
        await page.goto('https://google.com');
    });
    it('should display "google" text on page', async () => {
        await expect(page).toMatch('google');
    });
});*/
//npm test source/tests/sampleP.test.js
// need this line for the browser
const puppeteer = require('puppeteer');
let date = new Date();
const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];
let currentMonth = MONTH_NAMES[date.getMonth()];

describe('basic navigation for BJ', () => {
    var browser = null;
    var page = null;

    beforeAll(async () => {
        // need this to extend the amount of time that the jest can run. I just arbitrarily set it to a high number
        // so that we can test for a longer period
        jest.setTimeout(90000);
        // This sets up a browser so you can see the tests in action
        browser = await puppeteer.launch({
            headless: false,
            args: ["--no-sandbox", "disable-setuid-sandbox"],
            // increase slowMo value to make the tests go through the browser more slowly and vice versa
            // if things go too fast you may need to put in gaps using waitForTimeout
            slowMo: 50,
        });
        page = await browser.newPage();
        // used for seeing console messages
        // page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
        await page.goto('http://127.0.0.1:5500/source/Login/Login.html');

        await page.waitForTimeout(1000);
    });

    it('Test1: Initial Home Page - Shows create your login ', async () => {
        const headerText = await page.$eval('#title', (header) => {
            return header.innerHTML;
        });
        expect(headerText).toBe('Create your login!');
    });

    //Login tests

    it('LoginTest1: try to create account with blank username', async () => {
        await page.$eval('#username', (usernameInput) => {
            usernameInput.value = '';
        });

        await page.$eval('#pin', (passwordInput) => {
            passwordInput.value = '1234';
        });

        let msg = null;

        await page.click('#login-button', { clickCount: 1 });
        msg = await page.$eval('.error', (Userblank) => {
            return Userblank.innerHTML;
        });
        expect(msg).toBe('Please provide a username');
    });

    it('LoginTest2: try to create account with short username', async () => {
        await page.$eval('#username', (usernameInput) => {
            usernameInput.value = 'a';
        });

        await page.$eval('#pin', (passwordInput) => {
            passwordInput.value = '1234';
        });
        let msg = null;
        await page.click('#login-button', { clickCount: 1 });
        msg = await page.$eval('.error', (UserShort) => {
            return UserShort.innerHTML;
        });
        expect(msg).toBe('Username must be at least 2 characters long');
    });

    it('LoginTest3: try to create account with bad username (forbidden characters)', async () => {
        await page.$eval('#username', (usernameInput) => {
            usernameInput.value = 'ABC:DEF';
        });

        await page.$eval('#pin', (passwordInput) => {
            passwordInput.value = '1234';
        });
        let msg = null;
        await page.click('#login-button', { clickCount: 1 });
        msg = await page.$eval('.error', (UserNoS) => {
            return UserNoS.innerHTML;
        });
        expect(msg).toBe('Username must not contain special characters');
    });

    it('LoginTest4: try to create account with pin that is too short', async () => {
        await page.$eval('#username', (usernameInput) => {
            usernameInput.value = 'SampleUsername';
        });

        await page.$eval('#pin', (passwordInput) => {
            passwordInput.value = '12';
        });
        let msg = null;
        await page.click('#login-button', { clickCount: 1 });
        msg = await page.$eval('#errP', (pinShort) => {
            return pinShort.innerHTML;
        });
        expect(msg).toBe('PIN must be at least 4 digits long');
    });

    it('LoginTest5: try to create account with bad pin (invalid characters)', async () => {
        await page.$eval('#username', (usernameInput) => {
            usernameInput.value = 'SampleUsername';
        });

        await page.$eval('#pin', (passwordInput) => {
            passwordInput.value = '1234abc';
        });

        let msg = null;
        await page.click('#login-button', { clickCount: 1 });
        msg = await page.$eval('#errP', (pinSp) => {
            return pinSp.innerHTML;
        });
        expect(msg).toBe('PIN must contain numbers only');
    });

    it('Test2: create an account and login - shows index page ', async () => {
        jest.setTimeout(30000);
        await page.$eval('#username', (usernameInput) => {
            usernameInput.value = 'SampleUsername';
        });

        await page.$eval('#pin', (passwordInput) => {
            passwordInput.value = '1997';
        });

        await page.keyboard.press('Enter'); // to check for the enter key functionality
        await page.waitForTimeout(1000);

        const url = await page.evaluate(() => location.href);
        expect(url).toMatch('http://127.0.0.1:5500/source/Index/Index.html');
    });

    it('Test3: From index page go back, should be login page ', async () => {
        await page.goBack();
        const url = await page.evaluate(() => location.href);
        expect(url).toMatch('http://127.0.0.1:5500/source/Login/Login.html');
    });

    it('Test4: Login page should now be sign-in, not create account', async () => {
        const headerText = await page.$eval('#title', (header) => {
            return header.innerHTML;
        });
        expect(headerText).toBe('Welcome back!');
    });

    it('Test5: Input wrong password should give incorrect alert', async () => {
        let msg;
        await page.$eval('#username', (usernameInput) => {
            usernameInput.value = 'SampleUsername';
        });

        await page.$eval('#pin', (passwordInput) => {
            passwordInput.value = '123';
        });

        await page.click('#login-button', { clickCount: 1 });
        msg = await page.$eval('#errP', (incorrect) => {
            return incorrect.innerHTML;
        });
        expect(msg).toBe('Incorrect password!');
    });

    it('Test5.1: rest will update the password for that user stored in backend', async () => {
        await page.$eval('#reset-password-button', (button) => {
            button.click();
        });

        await page.$eval('#pin', (passwordInput) => {
            passwordInput.value = '2000';
        });
        await page.$eval('#reset-password-button', (button) => {
            button.click();
        });

        await page.goBack();
        let msg;
        await page.$eval('#username', (usernameInput) => {
            usernameInput.value = 'SampleUsername';
        });

        await page.$eval('#pin', (passwordInput) => {
            passwordInput.value = '1997';
        });

        await page.click('#login-button', { clickCount: 2 });
        msg = await page.$eval('#errP', (incorrectA) => {
            return incorrectA.innerHTML;
        });
        expect(msg).toBe('Incorrect password!');
    });

    it('Test6: go to index screen, make sure highlighted day is the current day', async () => {
        await page.goto('http://127.0.0.1:5500/source/Index/Index.html');
        await page.waitForTimeout(300);
        const currentDayHigh = await page.$eval('.today', (day) => {
            return day.innerHTML;
        });

        let currentDate = new Date();
        let date = currentDate.getDate();

        expect(currentDayHigh).toMatch(date.toString());
    });

    it('Home Page test1 : Check that the index.html page have Home and Timeline as their titles', async () => {
        await page.waitForTimeout(300);
        const hometitle = await page.$eval('#left-bar', (leftBarDiv) => {
            return leftBarDiv.querySelector('h1').innerHTML;
        });
        expect(hometitle).toMatch('Home');
        const timeline = await page.$eval('#right-bar', (rightBarDiv) => {
            return rightBarDiv.querySelector('h1').innerHTML;
        });
        expect(timeline).toMatch('Timeline');
    });

    it('Test7: click on "Go to current day", should go to day with correct date heading', async () => {
        await page.$eval('#today-button', (btn) => {
            btn.click();
        });
        await page.waitForTimeout(300);

        const currentDateStr = await page.$eval('#date', (dateHeader) => {
            return dateHeader.innerHTML;
        });

        let currentDate = new Date();

        //kinda too lazy to build the string
        let boolDay = currentDateStr.indexOf(`${currentDate.getDate()}`) > -1;
        let boolMonth =
            currentDateStr.indexOf(`${currentDate.getMonth() + 1}`) > -1;
        let boolYear =
            currentDateStr.indexOf(`${currentDate.getFullYear()}`) > -1;

        expect(`${boolDay && boolMonth && boolYear}`).toMatch('true');
    });

    it('Test8: current date URL should be correct', async () => {
        const url = await page.evaluate(() => location.href);

        let currentDate = new Date();

        //kinda too lazy to build the string
        let boolDay = url.indexOf(`${currentDate.getDate()}`) > -1;
        let boolMonth = url.indexOf(`${currentDate.getMonth() + 1}`) > -1;
        let boolYear = url.indexOf(`${currentDate.getFullYear()}`) > -1;

        expect(`${boolDay && boolMonth && boolYear}`).toMatch('true');
    });

    it('Test9: TODOs should be empty ', async () => {
        const bulletLength = await page.$eval('#bullets', (bullets) => {
            return bullets.childNodes.length;
        });

        expect(`${bulletLength}`).toMatch('0');
    });

    it('Test10: Notes should be empty ', async () => {
        const noteText = await page.$eval('note-box', (outerNote) => {
            // a lot of nesting inside the shadowDOM to get to the actual notes text box
            return outerNote.shadowRoot.lastElementChild.lastElementChild
                .innerHTML;
        });

        expect(noteText).toMatch('');
    });

    it('Test11: monthly goals should be empty ', async () => {
        const mGoalsLength = await page.$eval('#monthGoal', (mGoals) => {
            console.log(mGoals.childNodes);
            return mGoals.childNodes.length;
        });

        expect(`${mGoalsLength}`).toMatch('0');
    });

    it('Test12: yearly goals should be empty', async () => {
        const yGoalsLength = await page.$eval('#yearGoal', (yGoals) => {
            console.log(yGoals.childNodes);
            return yGoals.childNodes.length;
        });

        expect(`${yGoalsLength}`).toMatch('0');
    });

    it('Test13: photo album should be empty', async () => {
        const photoLength = await page.$eval('#photoCanvas', () => {
            console.log(window.Image.length);
            return window.Image.length;
        });

        expect(`${photoLength}`).toMatch('0');
    });

    it('Test14: add a bullet to TODO, check length', async () => {
        await page.$eval('.entry-form-text', (bulletEntry) => {
            bulletEntry.value = 'Finish 110 Lab';
        });

        await page.waitForTimeout(300);

        await page.$eval('.entry-form-button', (button) => {
            button.click();
        });

        const entryLength = await page.$eval('#bullets', (bullets) => {
            return bullets.childNodes.length;
        });

        expect(`${entryLength}`).toMatch('1');
    });

    it('Test15: edit a bullet in TODO', async () => {
        await page.waitForTimeout('300');

        /*
         * .on adds an event listener to the 'dialog' event,
         * since there are other functions that get called previously, we want to get
         * rid of those using removeAllListeners and add the one we want for
         * this particular test case
         */

        page.removeAllListeners('dialog');
        page.on('dialog', async (dialog) => {
            await dialog.accept('Finish 101 Final');
        });

        await page.$eval('bullet-entry', (bulletList) => {
            return bulletList.shadowRoot.querySelector('#edit').click();
        });

        await page.waitForTimeout('300');

        let bulletText = await page.$eval('bullet-entry', (bulletList) => {
            return bulletList.shadowRoot.querySelector('.bullet-content')
                .innerHTML;
        });

        expect(bulletText).toMatch('Finish 101 Final');
    });

    it('Test16: add a child bullet in TODO', async () => {
        page.removeAllListeners('dialog');
        page.on('dialog', async (dialog) => {
            await dialog.accept('Remember to fill out CAPES');
        });

        await page.$eval('bullet-entry', (bulletList) => {
            //clicks "add" for the bullet
            bulletList.shadowRoot.querySelector('#add').click();
        });

        await page.waitForTimeout('300');

        let bulletChildren = await page.$eval('bullet-entry', (bulletList) => {
            //gets the length of how many children the bullet has
            return bulletList.shadowRoot.querySelector('.child').children
                .length;
        });

        expect(`${bulletChildren}`).toMatch('1');
    });

    it('Test17: child bullet has correct text', async () => {
        let bulletChildText = await page.$eval('bullet-entry', (bulletList) => {
            //gets the content of the child bullet
            return bulletList.shadowRoot.querySelector('.child > bullet-entry')
                .entry.content;
        });

        expect(bulletChildText).toMatch('Remember to fill out CAPES');
    });

    it('Test18: mark child done bullet in TODO', async () => {
        await page.$eval('bullet-entry', (bulletList) => {
            //clicks "done" for the child bullet
            return bulletList.shadowRoot
                .querySelector('.child > bullet-entry')
                .shadowRoot.querySelector('#done')
                .click();
        });

        let bulletChildDecor = await page.$eval(
            'bullet-entry',
            (bulletList) => {
                //gets the style of the text of the child bullet
                return bulletList.shadowRoot
                    .querySelector('.child > bullet-entry')
                    .shadowRoot.querySelector('.bullet-content').style
                    .textDecoration;
            }
        );

        expect(bulletChildDecor).toMatch('line-through');
    });

    it('Test19: delete a child bullet in TODO', async () => {
        await page.$eval('bullet-entry', (bulletList) => {
            //gets the child bullet and deletes it
            return bulletList.shadowRoot
                .querySelector('.child > bullet-entry')
                .shadowRoot.querySelector('#delete')
                .click();
        });

        await page.waitForTimeout('300');

        const entryLength = await page.$eval('bullet-entry', (bullets) => {
            //gets how many children the bullet has
            return bullets.shadowRoot.querySelector('.child').childNodes.length;
        });

        expect(`${entryLength}`).toMatch('0');
    });

    /**
     * add a child bullet, delete top level, both should disapear?
     */
    it('Test20a: add a child bullet in TODO, delete parent pt1', async () => {
        page.removeAllListeners('dialog');
        page.on('dialog', async (dialog) => {
            await dialog.accept('Remember to fill out TA CAPES');
        });

        await page.$eval('bullet-entry', (bulletList) => {
            //clicks "add" for the bullet
            bulletList.shadowRoot.querySelector('#add').click();
        });

        await page.waitForTimeout('300');

        let bulletChildren = await page.$eval('bullet-entry', (bulletList) => {
            //gets the length of how many children the bullet has
            return bulletList.shadowRoot.querySelector('.child').children
                .length;
        });

        expect(`${bulletChildren}`).toMatch('1');
    });

    it('Test20b: add a child bullet in TODO, delete parent pt2', async () => {
        await page.$eval('bullet-entry', (bulletList) => {
            //clicks "add" for the bullet
            bulletList.shadowRoot.querySelector('#delete').click();
        });

        await page.waitForTimeout('300');

        let bulletChildrenLen = await page.$eval('#bullets', (bulletList) => {
            //gets the length of how many children the bullet has
            return bulletList.childNodes.length;
        });

        expect(`${bulletChildrenLen}`).toMatch('0');
    });

    it('Test21: adding notes shows up', async () => {
        await page.$eval('note-box', (notebox) => {
            //test note box text
            notebox.shadowRoot.querySelector('.noteContent').innerHTML =
                'pickup amazon package from locker';
        });

        await page.waitForTimeout('300');

        let noteText = await page.$eval('note-box', (notebox) => {
            //gets text from note box
            return notebox.shadowRoot.querySelector('.noteContent').value;
        });

        /**
         * This doesn't actually save the text, since that is done on a "mouse hover" event when the mouse
         * leaves the text area
         */

        expect(noteText).toMatch('pickup amazon package from locker');
    });

    it('Test22: go to monthly overview through <Month button', async () => {
        await page.waitForTimeout(300);

        await page.$eval('#words', (button) => {
            button.click();
        });

        await page.waitForTimeout(300);

        const url = await page.evaluate(() => location.href);

        let currentDate = new Date();

        //kinda too lazy to build the string
        let boolMonth = url.indexOf(`${currentDate.getMonth() + 1}`) > -1;
        let boolYear = url.indexOf(`${currentDate.getFullYear()}`) > -1;

        expect(`${boolMonth && boolYear}`).toMatch('true');
    });

    it('Test23: making sure monthly goals are empty', async () => {
        const bulletLength = await page.$eval('#bullets', (bullets) => {
            return bullets.childNodes.length;
        });

        expect(`${bulletLength}`).toMatch('0');
    });

    it('Test24: adding monthly goals, check length', async () => {
        await page.$eval('.entry-form-text', (bulletEntry) => {
            bulletEntry.value = 'Drink more water';
        });

        await page.waitForTimeout(300);

        await page.$eval('.entry-form-button', (button) => {
            button.click();
        });

        const entryLength = await page.$eval('#bullets', (bullets) => {
            return bullets.childNodes.length;
        });

        expect(`${entryLength}`).toMatch('1');
    });

    it('Test25: navigating to daily through calendar in monthly', async () => {
        await page.$eval('.today', (button) => {
            button.click();
        });

        const url = await page.evaluate(() => location.href);

        let currentDate = new Date();

        //kinda too lazy to build the string
        let boolDay = url.indexOf(`${currentDate.getDate()}`) > -1;
        let boolMonth = url.indexOf(`${currentDate.getMonth() + 1}`) > -1;
        let boolYear = url.indexOf(`${currentDate.getFullYear()}`) > -1;

        expect(`${boolDay && boolMonth && boolYear}`).toMatch('true');
    });

    it('Test26: check monthly goals added in daily overview', async () => {
        const mGoalsText = await page.$eval('#monthGoal', (mGoals) => {
            return mGoals.innerHTML;
        });

        expect(`${mGoalsText}`).toMatch('Drink more water');
    });

    it('Test27: edit monthly goals', async () => {
        await page.goBack();

        await page.waitForTimeout('300');

        page.removeAllListeners('dialog');
        page.on('dialog', async (dialog) => {
            await dialog.accept('Drink 5 cups of water everyday');
        });

        await page.$eval('goals-entry', (bulletList) => {
            return bulletList.shadowRoot.querySelector('#edit').click();
        });

        await page.waitForTimeout('300');

        let bulletText = await page.$eval('goals-entry', (bulletList) => {
            return bulletList.shadowRoot.querySelector('.bullet-content')
                .innerHTML;
        });

        expect(bulletText).toMatch('Drink 5 cups of water everyday');
    });

    it('Test28: check monthly goals edited in daily overview', async () => {
        await page.waitForTimeout('300');

        await page.$eval('.today', (button) => {
            button.click();
        });

        const mGoalsText = await page.$eval('#monthGoal', (mGoals) => {
            return mGoals.innerHTML;
        });

        expect(`${mGoalsText}`).toMatch('Drink 5 cups of water everyday');
    });

    it('Test29: mark done monthly goals', async () => {
        await page.goBack();

        await page.$eval('goals-entry', (bulletList) => {
            return bulletList.shadowRoot.querySelector('#done').click();
        });

        let bulletText = await page.$eval('goals-entry', (bulletList) => {
            return bulletList.shadowRoot.querySelector('.bullet-content').style
                .textDecoration;
        });

        expect(bulletText).toMatch('line-through');
    });

    it('Test30: mark not done monthly goals', async () => {
        let bulletText = await page.$eval('goals-entry', (bulletList) => {
            return bulletList.shadowRoot.querySelector('#done').innerText;
        });

        expect(bulletText).toMatch('Mark Not Done');
    });

    it('Test30: check monthly goals marked done in daily overview', async () => {
        await page.waitForTimeout('300');

        await page.$eval('.today', (button) => {
            button.click();
        });

        const mGoalsText = await page.$eval('p', (mGoals) => {
            return mGoals.style.textDecoration;
        });

        expect(`${mGoalsText}`).toMatch('line-through');
    });

    it('Test31: delete monthly goals', async () => {
        await page.goBack();

        await page.waitForTimeout('300');

        await page.$eval('goals-entry', (bulletList) => {
            return bulletList.shadowRoot.querySelector('#delete').click();
        });

        await page.waitForTimeout('300');

        const bulletLength = await page.$eval('#bullets', (bullets) => {
            return bullets.childNodes.length;
        });

        expect(`${bulletLength}`).toMatch('0');
    });

    it('Test32: check monthly goals removed in daily overview', async () => {
        await page.$eval('.today', (button) => {
            button.click();
        });

        const mGoalsLength = await page.$eval('#monthGoal', (mGoals) => {
            console.log(mGoals.childNodes);
            return mGoals.childNodes.length;
        });

        expect(`${mGoalsLength}`).toMatch('0');
    });

    it('Test33: check <Year button in monthly overview works', async () => {
        await page.goBack();

        await page.waitForTimeout(300);

        await page.$eval('#back', (button) => {
            button.click();
        });

        const url = await page.evaluate(() => location.href);

        let currentDate = new Date();

        //kinda too lazy to build the string
        let boolYear = url.indexOf(`${currentDate.getFullYear()}`) > -1;

        expect(`${boolYear}`).toMatch('true');
    });

    it('Test34: making sure yearly goals should be empty', async () => {
        const bulletLength = await page.$eval('#bullets', (bullets) => {
            return bullets.childNodes.length;
        });

        expect(`${bulletLength}`).toMatch('0');
    });

    it('Test35: adding yearly goals, check length', async () => {
        await page.$eval('.entry-form-text', (bulletEntry) => {
            bulletEntry.value = '1 boba per week';
        });

        await page.waitForTimeout(300);

        await page.$eval('.entry-form-button', (button) => {
            button.click();
        });

        const entryLength = await page.$eval('#bullets', (bullets) => {
            return bullets.childNodes.length;
        });

        expect(`${entryLength}`).toMatch('1');
    });

    it('Test36: navigating through the months should work', async () => {
        await page.$eval('#' + currentMonth, (button) => {
            button.click();
        });

        await page.waitForTimeout(300);

        const url = await page.evaluate(() => location.href);

        let currentDate = new Date();

        //kinda too lazy to build the string
        let boolYear = url.indexOf(`${currentDate.getFullYear()}`) > -1;
        let boolMonth = url.indexOf(`${currentDate.getMonth() + 1}`) > -1;

        expect(`${boolMonth && boolYear}`).toMatch('true');
    });

    it('Test37: check yearly goals added in daily overview', async () => {
        await page.$eval('.today', (button) => {
            button.click();
        });

        const yGoalsText = await page.$eval('#yearGoal', (yGoals) => {
            return yGoals.innerHTML;
        });

        expect(`${yGoalsText}`).toMatch('1 boba per week');
    });

    it('Test38: edit yearly goals', async () => {
        await page.goBack();
        await page.goBack();

        await page.waitForTimeout('300');

        page.removeAllListeners('dialog');
        page.on('dialog', async (dialog) => {
            await dialog.accept('2 boba per week');
        });

        await page.$eval('goals-entry', (bulletList) => {
            return bulletList.shadowRoot.querySelector('#edit').click();
        });

        await page.waitForTimeout('300');

        let bulletText = await page.$eval('goals-entry', (bulletList) => {
            return bulletList.shadowRoot.querySelector('.bullet-content')
                .innerHTML;
        });

        expect(bulletText).toMatch('2 boba per week');
    });

    it('Test39: check yearly goals edited in yearly overview', async () => {
        await page.$eval('#' + currentMonth, (button) => {
            button.click();
        });

        await page.waitForTimeout(300);

        await page.$eval('.today', (button) => {
            button.click();
        });

        await page.waitForTimeout(300);

        const yGoalsText = await page.$eval('#yearGoal', (yGoals) => {
            return yGoals.innerHTML;
        });

        expect(`${yGoalsText}`).toMatch('2 boba per week');
    });

    it('Test40: mark done yearly goals', async () => {
        await page.goBack();
        await page.goBack();

        await page.$eval('goals-entry', (bulletList) => {
            return bulletList.shadowRoot.querySelector('#done').click();
        });

        let bulletText = await page.$eval('goals-entry', (bulletList) => {
            return bulletList.shadowRoot.querySelector('.bullet-content').style
                .textDecoration;
        });

        expect(bulletText).toMatch('line-through');
    });

    it('Test41: check yearly goals marked done in daily overview', async () => {
        await page.$eval('#' + currentMonth, (button) => {
            button.click();
        });

        await page.waitForTimeout('300');

        await page.$eval('.today', (button) => {
            button.click();
        });

        const yGoalsText = await page.$eval('p', (yGoals) => {
            return yGoals.style.textDecoration;
        });

        expect(`${yGoalsText}`).toMatch('line-through');
    });

    it('Test42: delete yearly goals', async () => {
        await page.goBack();
        await page.goBack();

        await page.waitForTimeout('300');

        await page.$eval('goals-entry', (bulletList) => {
            return bulletList.shadowRoot.querySelector('#delete').click();
        });

        await page.waitForTimeout('300');

        const bulletLength = await page.$eval('#bullets', (bullets) => {
            return bullets.childNodes.length;
        });

        expect(`${bulletLength}`).toMatch('0');
    });

    it('Test43: check yearly goals removed in daily overview', async () => {
        await page.$eval('#' + currentMonth, (button) => {
            button.click();
        });

        await page.waitForTimeout('300');

        await page.$eval('.today', (button) => {
            button.click();
        });

        const yGoalsLength = await page.$eval('#yearGoal', (yGoals) => {
            console.log(yGoals.childNodes);
            return yGoals.childNodes.length;
        });

        expect(`${yGoalsLength}`).toMatch('0');
    });

    it('Test44: check <Index button in yearly overview works', async () => {
        await page.goBack();
        await page.goBack();

        await page.waitForTimeout(300);

        await page.$eval('#back', (button) => {
            button.click();
        });

        const url = await page.evaluate(() => location.href);

        expect(`${url}`).toMatch(
            'http://127.0.0.1:5500/source/Index/Index.html'
        );
    });

    it('Test45: check that the calendar in the index page works properly', async () => {
        await page.$eval('.today', (button) => {
            button.click();
        });

        const url = await page.evaluate(() => location.href);

        let currentDate = new Date();

        //kinda too lazy to build the string
        let boolDay = url.indexOf(`${currentDate.getDate()}`) > -1;
        let boolMonth = url.indexOf(`${currentDate.getMonth() + 1}`) > -1;
        let boolYear = url.indexOf(`${currentDate.getFullYear()}`) > -1;

        expect(`${boolDay && boolMonth && boolYear}`).toMatch('true');
    });

    it('Test46: check that going to certain years work in the index page', async () => {
        await page.goBack();

        /**
         * for some reason, the css selectors don't like underscores or ids beginning with numbers
         * have to manually traverse through the children to find the correct year
         * namning mistake
         * Just going to use 2021 as an example
         */

        await page.$eval('#content', (section) => {
            //gets the index of the year 2021
            section.childNodes[7].querySelector('.yearlink').click();
        });

        const url = await page.evaluate(() => location.href);
        console.log(url);

        //kinda too lazy to build the string
        let boolYear = url.indexOf('2021') > -1;

        expect(`${boolYear}`).toMatch('true');
    });

    it('Test47: check that the home button works in the yearly overview', async () => {
        const indexURL = 'http://127.0.0.1:5500/source/Index/Index.html';
        await page.goto(
            'http://127.0.0.1:5500/source/YearlyOverview/YearlyOverview.html#2021'
        );

        await page.$eval('#house > a', (btn) => {
            btn.click();
        });
        const url = await page.evaluate(() => location.href);

        expect(url).toMatch(indexURL);
    });
    it('Test48: check that the home button works in the monthly overview', async () => {
        const indexURL = 'http://127.0.0.1:5500/source/Index/Index.html';
        await page.goto(
            'http://127.0.0.1:5500/source/MonthlyOverview/MonthlyOverview.html#06/2021'
        );
        await page.waitForTimeout('300');
        await page.$eval('#house > a', (btn) => {
            btn.click();
        });
        const url = await page.evaluate(() => location.href);
        expect(url).toMatch(indexURL);
    });
    it('Test49: check that the home button works in the daily overview', async () => {
        const indexURL = 'http://127.0.0.1:5500/source/Index/Index.html';
        await page.goto(
            'http://127.0.0.1:5500/source/DailyOverview/DailyOverview.html#06/08/2021'
        );
        await page.waitForTimeout('300');
        await page.$eval('#homeContainer > a', (btn) => {
            btn.click();
        });
        const url = await page.evaluate(() => location.href);
        expect(url).toMatch(indexURL);
    });
    it('Test50: Change background color', async () => {
        const currentTheme = await page.select('#themes', '#ECC7C7');
        expect(currentTheme.toString()).toMatch('#ECC7C7');
    });
    it('Test51: Check MonthlyOverview link text is correct on DailyOverview', async () => {
        // Testing solution to Issue #27

        // gets .today and passes it to callback function to click today calendar btn
        await page.$eval('.today', (todayBtn) => {
            todayBtn.click();
        });

        /* gets current month name */
        const currentDate = new Date();

        const expected = `${
            MONTH_NAMES[currentDate.getMonth()]
        } ${currentDate.getFullYear()} Overview`;

        /* gets MonthlyOverview link text */
        const monthlyOverviewLink = await page.$('#monthView > a:first-child');
        const linkText = await (
            await monthlyOverviewLink.getProperty('textContent')
        ).jsonValue();

        expect(expected).toMatch(linkText); // compare expected month to real month
    });
    it('Test52: Check YearlyOverview link text is correct on MonthlyOverview', async () => {
        // Testing solution to Issue #27

        // gets MonthlyOverview link and passes it to callback function to click MonthlyOverview btn
        await page.$eval('#monthView > a:first-child', (todayBtn) => {
            todayBtn.click();
        });

        /* gets current year */
        const currentDate = new Date();
        const expected = `${currentDate.getFullYear()} Overview`;

        /* gets MonthlyOverview link text */
        const yearlyOverviewLink = await page.$('#back');
        const linkText = await (
            await yearlyOverviewLink.getProperty('textContent')
        ).jsonValue();

        expect(expected).toMatch(linkText); // compare expected month to real month
    });
    it('Test53: check when adding notes, an alert pops up indicating forbiden operation for year page', async () => {
        page.removeAllListeners('dialog');
        await page.goto(
            'http://127.0.0.1:5500/source/YearlyOverview/YearlyOverview.html#2018'
        );
        let msg = null;
        page.on('dialog', async (dialog) => {
            await page.waitForTimeout(1000);
            msg = dialog.message();
            await dialog.dismiss();
        });
        await page.$eval('#entry-button', (button) => {
            button.click();
        });
        expect(msg).toMatch('Please enter a note');
    });
    it('Test54: check when adding notes, an alert pops up indicating forbiden operation for month page', async () => {
        page.removeAllListeners('dialog');
        await page.goto(
            'http://127.0.0.1:5500/source/MonthlyOverview/MonthlyOverview.html#01/2018'
        );
        let msg = null;
        page.on('dialog', async (dialog) => {
            await page.waitForTimeout(1000);
            msg = dialog.message();
            await dialog.dismiss();
        });
        await page.$eval('#entry-button', (button) => {
            button.click();
        });
        expect(msg).toMatch('Please enter a note');
    });
    it('Test55: check when adding notes, an alert pops up indicating forbiden operation for day page', async () => {
        page.removeAllListeners('dialog');
        await page.goto(
            'http://127.0.0.1:5500/source/DailyOverview/DailyOverview.html#01/01/2018'
        );
        let msg = null;
        page.on('dialog', async (dialog) => {
            await page.waitForTimeout(1000);
            msg = dialog.message();
            await dialog.dismiss();
        });
        await page.$eval('#entry-button', (button) => {
            button.click();
        });

        expect(msg).toMatch('Please enter a goal');
    });

    it('close browser', async () => {
        browser.close();
    });
});
