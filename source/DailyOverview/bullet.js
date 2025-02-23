// <bullet-entry> custom web component
class BulletEntry extends HTMLElement {
    constructor() {
        super();

        const template = document.createElement('template');

        template.innerHTML = `
            <style>
                .bullet{
                    -word-break: break-all;
                    max-width: 100%;
                    font-size: 1rem;
                }
                .child{
                    padding-left: 2vw;
                }
                .bullet-container{
                    display: inline-block;
                }
                li > span {
                    position: relative;
                }
                ul {
                    padding: 0px 0px 0px 15px;
                    margin: 0;
                }
                li {
                    padding: 5px;
                }
                .dropdownContainer {
                    position: relative;
                    display: inline-block;
                    top: 5px;
                }
                .clicked {
                    background-color: #858585;
                }
                .dropdown {
                    display: none;
                    position: absolute;
                    background-color: #e4e4e4;
                    z-index: 1;
                    transform: translateX(-25%) translateY(-5px);
                }
                .dropdown p {
                    position: relative;
                    color: black;
                    font-size: .85rem;
                    padding: .25rem;
                    display: flex;
                    flex-direction: column;
                    gap: .5rem;
                    text-align: center;
                    justify-content: space-evenly;
                    margin: 0;
                    background-color: #e4e4e4;
                    width: min-content;
                }
                .dropdown p > img {
                    height: 25px;
                }
                .dropdown p:hover {
                    background-color: #cecece;
                    cursor: pointer
                }
                .dropdownContainer:hover .dropdown {
                    display: block;
                }
                .dropdownButton {
                    font-size: 1.1vw;
                    width: 1vw;
                    height: 1vw;
                    transform: translateY(-0.1vh);
                    padding: 0;
                    background-color: #e4e4e4;
                    border: none;
                    border-radius: 0.5vh;
                    cursor: pointer;
                }
                .dropdownButton > img {
                    display: block;
                }
                #features {
                    width: 100%;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    background-color: #e4e4e4;
                    font-family: 'Courier', monospace;
                    font-weight: bold;
                    padding-top: .5rem;
                    padding-bottom: .5rem;
                }
                img {
                    width: 100%;
                }
                .row {
                    display: flex;
                    flex-direction: row;
                }

            </style>
            <article class="bullet">
                <div id="container">
                    <ul>
                        <li>
                            <span class="bullet-content">Setting text</span>
                        <div class="dropdownContainer">
                            <button id="dropdownHover" class="dropdownButton">
                                <img src="../Images/dropdown-icon.svg" alt="dropdown"/>
                            </button>
                            <div class="dropdown">
                                <div class="row">
                                    <p id="edit"><img src="images/Edit.svg" alt="Edit">Edit</p>
                                    <p id="delete"><img src="images/Delete.svg" alt="Delete">Delete</p>
                                    <p id="add"><img src="images/Add.svg" alt="Add">Subtask</p>
                                    <p id="done"><img src="images/Done.svg" alt="Done">Done</p>
                                </div>
                                    <select id="features"> 
                                        <option id="normal" value="normal">Normal</option> 
                                        <option id="important" value="important">Important</option>
                                        <option id="workRelated" value="workRelated">School</option>
                                        <option id="household" value="household">Household</option>
                                        <option id="personal" value="personal">Personal</option>
                                        <option id="event" value="event">Event</option>
                                        <option id="other" value="other">Other</option>
                                    </select>
                            </div>
                        </div>
                        <div class="child"></div>
                        </li>
                    </ul>
                </div>
            </article>
        `;

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // edit bullet through a prompt
        this.shadowRoot.querySelector('#edit').addEventListener('click', () => {
            let newJson = JSON.parse(this.getAttribute('bulletJson'));
            let editedEntry = prompt(
                'Edit Bullet',
                this.shadowRoot.querySelector('.bullet-content').innerText
            );
            if (editedEntry != null && editedEntry != '') {
                this.shadowRoot.querySelector(
                    '.bullet-content'
                ).innerText = editedEntry;
                newJson.text = editedEntry;
                this.setAttribute('bulletJson', JSON.stringify(newJson));
            }
            this.dispatchEvent(this.edited);
        });

        // delete bullet
        this.shadowRoot
            .querySelector('#delete')
            .addEventListener('click', () => {
                this.dispatchEvent(this.deleted);
            });

        // add child bullet
        this.shadowRoot.querySelector('#add').addEventListener('click', () => {
            let newEntry = prompt('Add Bullet', '');
            let newChild = document.createElement('bullet-entry');
            let newJson = JSON.parse(this.getAttribute('bulletJson'));
            let newIndex = JSON.parse(this.getAttribute('index'));
            let childJson = {
                text: newEntry,
                features: 'normal',
                done: false,
                childList: [],
                time: null,
            };
            let childLength = newJson.childList.length;

            // if user cancels
            if (newEntry == null) {
                return;
            }

            // set bullet content of new child
            newChild.shadowRoot.querySelector(
                '.bullet-content'
            ).innerText = newEntry;

            // set new child's new bulletJson and index object
            newChild.setAttribute('bulletJson', JSON.stringify(childJson));
            if (childLength > 0) {
                newIndex.push(childLength);
                newChild.index = newIndex;
                newChild.setAttribute('index', JSON.stringify(newIndex));
            } else {
                newIndex.push(0);
                newChild.index = newIndex;
                newChild.setAttribute('index', JSON.stringify(newIndex));
            }

            // append new child to page
            this.shadowRoot.querySelector('.child').appendChild(newChild);

            // update bulletJson of parent bullet
            newJson.childList.push(childJson);
            this.setAttribute('bulletJson', JSON.stringify(newJson));

            // changed this bullet
            this.dispatchEvent(this.added);
        });

        // mark bullet as done
        this.shadowRoot.querySelector('#done').addEventListener('click', () => {
            this.dispatchEvent(this.done);
        });

        // mark bullet category
        this.shadowRoot
            .querySelector('#features')
            .addEventListener('change', () => {
                let newJson = JSON.parse(this.getAttribute('bulletJson'));
                let selectElement = this.shadowRoot.querySelector('#features');
                let output = selectElement.value;
                newJson.features = output;
                this.setAttribute('bulletJson', JSON.stringify(newJson));
                this.dispatchEvent(this.features);
            });

        // new event to see when bullet child is added
        this.added = new CustomEvent('added', {
            bubbles: true,
            composed: true,
        });

        // new event to see when bullet is deleted
        this.deleted = new CustomEvent('deleted', {
            bubbles: true,
            composed: true,
        });

        // new event to see when bullet is edited
        this.edited = new CustomEvent('edited', {
            bubbles: true,
            composed: true,
        });

        // new event to mark event as done
        this.done = new CustomEvent('done', {
            bubbles: true,
            composed: true,
        });

        // new event to see what category it is
        this.features = new CustomEvent('features', {
            bubbles: true,
            composed: true,
        });
    }

    /**
     * when getting the entry, return just the text for now
     */
    get entry() {
        let entryObj = {
            content: this.shadowRoot.querySelector('.bullet-content').innerText,
        };
        return entryObj;
    }

    set entry(entry) {
        // set the text of the entry
        this.shadowRoot.querySelector('.bullet-content').innerText = entry.text;

        // see if it's marked as done
        if (entry.done == true) {
            this.shadowRoot.querySelector(
                '.bullet-content'
            ).style.textDecoration = 'line-through';
        }

        this.shadowRoot
            .getElementById(entry.features)
            .setAttribute('selected', 'true');

        switch (entry.features) {
            case 'normal':
                this.shadowRoot.querySelector('ul').style.listStyleImage =
                    'none';
                break;
            case 'important': // star icon
                this.shadowRoot.querySelector('ul').style.listStyleImage =
                    // required to use double quotes below due to inner single quotes
                    // eslint-disable-next-line quotes
                    "url('./images/Star.svg')";
                break;
            case 'workRelated': // pencil
                this.shadowRoot.querySelector('ul').style.listStyleImage =
                    // required to use double quotes below due to inner single quotes
                    // eslint-disable-next-line quotes
                    "url('./images/Pencil.svg')";
                break;
            case 'household': // house
                this.shadowRoot.querySelector('ul').style.listStyleImage =
                    // required to use double quotes below due to inner single quotes
                    // eslint-disable-next-line quotes
                    "url('./images/House.svg')";
                break;
            case 'personal': // heart
                this.shadowRoot.querySelector('ul').style.listStyleImage =
                    // required to use double quotes below due to inner single quotes
                    // eslint-disable-next-line quotes
                    "url('./images/Heart.svg')";
                break;
            case 'event': // heart
                this.shadowRoot.querySelector('ul').style.listStyleImage =
                    // required to use double quotes below due to inner single quotes
                    // eslint-disable-next-line quotes
                    "url('./images/Event.svg')";
                break;
            case 'other': // square
                this.shadowRoot.querySelector('ul').style.listStyleType =
                    'square';
                break;
        }
    }

    set index(index) {
        if (index.length > 2) {
            this.shadowRoot.querySelector('#add').remove();
        }
    }

    set child(child) {
        // set nested bullets of entries
        this.shadowRoot.querySelector('.child').appendChild(child);
    }
}

customElements.define('bullet-entry', BulletEntry);
