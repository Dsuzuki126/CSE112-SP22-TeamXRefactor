// <goals-entry> custom web component
class GoalsEntry extends HTMLElement {
    constructor() {
        super();
        const template = document.createElement('template');

        template.innerHTML = `
            <style>
                .bullet{
                    word-break: break-all;
                    max-width: 100%;
                    font-size: 1.1vw;
                }
                .bullet-container{
                    display: inline-block; !important
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
                    min-width: 6vw;
                    z-index: 1;
                    transform: translateY(-5px);
                    
                }
                .dropdown p {
                    color: black;
                    font-size: 1vw;
                    padding: 0.5vh 0 0.5vh 0.5vh;
                    display: block;
                    margin: 0;
                    background-color: #e4e4e4;
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
                    cursor:pointer;
                }
            </style>
            <article class="bullet">
            <div id="container">
                <ul>
                    <li>
                        <span class="bullet-content">Setting text</span>
                    <div class="dropdownContainer">
                        <button class="dropdownButton">
                            <img src="../Images/dropdown-icon.svg" alt="dropdown"/>
                        </button>
                        <div class="dropdown">
                            <p id="edit">Edit</p>
                            <p id="delete">Delete</p>
                            <p id="done">Mark Done</p>
                        </div>
                    </div>
                    </li>
                </ul>
            </div>
            </article>
            `;

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // edit goal through a prompt
        this.shadowRoot.querySelector('#edit').addEventListener('click', () => {
            let newJson = JSON.parse(this.getAttribute('goalJson'));
            let editedEntry = prompt(
                'Edit Bullet',
                this.shadowRoot.querySelector('.bullet-content').innerText
            );
            if (editedEntry != null && editedEntry != '') {
                this.shadowRoot.querySelector(
                    '.bullet-content'
                ).innerText = editedEntry;
                newJson.text = editedEntry;
                this.setAttribute('goalJson', JSON.stringify(newJson));
            }
            this.dispatchEvent(this.edited);
        });

        // mark bullet as done/undone
        this.shadowRoot.querySelector('#done').addEventListener('click', () => {
            this.dispatchEvent(this.done);
        });

        // delete goal
        this.shadowRoot
            .querySelector('#delete')
            .addEventListener('click', () => {
                this.dispatchEvent(this.deleted);
            });

        // new event to see when goal is deleted
        this.deleted = new CustomEvent('deleted', {
            bubbles: true,
            composed: true,
        });

        // new event to see when goal is edited
        this.edited = new CustomEvent('edited', {
            bubbles: true,
            composed: true,
        });

        // new event to mark event as done
        this.done = new CustomEvent('done', {
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
            this.shadowRoot.querySelector('#done').innerText = 'Mark Not Done';
        } else {
            this.shadowRoot.querySelector('#done').innerText = 'Mark Done';
        }
    }
}

customElements.define('goals-entry', GoalsEntry);
