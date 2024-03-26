import path from 'path';
import {correct, StageTest, wrong} from 'hs-test-web';

const pagePath = path.join(import.meta.url, '../../src/index.html');

global.browserOptions = {
    defaultViewport: {
        width: 1024,
        height: 768
    }
}

class Test extends StageTest {

    page = this.getPage(pagePath)

    tests = [this.page.execute(() => {
        // test #1
        // HELPERS-->
        // method to check if element with id exists
        this.elementExists = (selector, nodeNames) => {
            const element = document.body.querySelector(selector);
            if (!element) return true;
            else return (nodeNames && !nodeNames.includes(element.nodeName.toLowerCase()));
        };

        // method to check if element with selector has right text
        this.elementHasText = (selector, correctText) => {
            const element = document.body.querySelector(selector);
            if (!element) return true;

            if (correctText) {
                return (element.innerText !== correctText);
            }

            return !element.innerText || element.innerText.trim().length === 0;
        };

        // method to check if element with selector has right attribute
        this.elementHasAttribute = (selector, attribute, value) => {
            const element = document.body.querySelector(selector);
            if (!element) return true;
            const attributeValue = element.getAttribute(attribute);
            if (!attributeValue) return true;
            // console.log(attributeValue);
            return value && attributeValue !== value;
        };

        // check link
        this.checkLink = (order, originalUrl) => {
            // check if li exists
            const li = document.body.querySelector(`#list-url > li:nth-child(${order})`);
            if (!li) return wrong("The li element is not displayed in #list-url after clicking the button.");

            // check if a exists
            const a = li.querySelector("a");
            if (!a) return wrong("The link is not displayed inside a list-item after clicking the button.");

            // check if a has inner text
            if (!a.innerText) return wrong("The link does not have a text.");

            // check if link starts with localhost
            if (!a.innerText.startsWith("localhost/"))
                return wrong("The link does not start with localhost/.");

            // check if a text is 5 characters
            if (a.innerText.split("localhost/")[1].length !== 5)
                return wrong("The link does not have the correct short URL length.");

            // check if a has href
            if (this.elementHasAttribute("a", "href", originalUrl))
                return wrong("The link does not have the correct href attribute.");

            // check if a has target
            if (this.elementHasAttribute("a", "target", "_blank"))
                return wrong("The link does not have the correct target attribute.");

            // check if li has correct text
            if (!li.innerText.includes(originalUrl))
                return wrong("The li element does not have the correct text.");

            // check if link random text
            if (order === 2) {
                const a1 = document.body.querySelector(`#list-url > li:nth-child(1) a`);
                const a2 = document.body.querySelector(`#list-url > li:nth-child(2) a`);
                if (a1.innerText === a2.innerText)
                    return wrong("The link is not random.");
            }

            // check if button exists
            const button = li.querySelector("button");
            if (!button) return wrong("The 'Edit' button is not displayed inside a list-item after clicking the button.");

            // check if button has correct text
            if (button.innerText !== "Edit")
                return wrong("The 'Edit' button does not have the correct text.");
        };

        // check p
        this.checkP = () => {
            // check if p exists
            const p = document.body.querySelector("p");
            if (!p) return wrong("The paragraph is not displayed after clicking the button with wrong input.");

            // check if p has text
            const pText = "Please enter a valid url";
            if (p.innerText !== pText)
                return wrong("The paragraph does not have the correct text.");
        };

        // empty input
        this.emptyInput = () => {
            const input = document.body.querySelector("#input-url");
            if (!input) return wrong("The input field is missing.");
            input.value = "";
        };

        // check click counts
        this.checkClickCounts = (order, count) => {
            const li = document.body.querySelector(`#list-url > li:nth-child(${order})`);
            if (!li) return wrong("The li element is not displayed in #list-url after clicking the button.");
            const spans = li.querySelectorAll("span");
            if (spans.length > 1) return wrong("The li element has more than one span element.");
            const span = li.querySelector("span");
            if (!span) return wrong("The span element is not displayed in the li element after clicking the button.");
            const correctText = 'Clicks:';
            if (!span.innerText.includes(correctText))
                return wrong(`The span element does not include the correct text: '${correctText}' .`);
            if (!span.innerText.includes(count)) return wrong("The span element does not have the correct click count.");
        }

        // check list empty
        this.checkListEmpty = () => {
            const ul = document.body.querySelector("#list-url");
            if (!ul) return wrong("The ul element is missing.");
            if (ul.children.length !== 0) return wrong("The ul element should be empty after clicking the button: '#button-delete'.");
        }

        // check input link deleted
        this.checkInputLinkDeleted = (input) => {
            const lis = Array.from(document.body.querySelectorAll(`#list-url > li`));

            if (lis.length === 0)
                return wrong("You should only delete the entered matching links from the list.");

            let isFalse = false;
            for (let i = 0; i < lis.length; i++) {
                const liText = lis[i].innerText;
                if (liText.includes(input)) isFalse = true;
            }
            if (isFalse) return wrong("The entered link is not deleted from the list. All occurrences should be deleted.");
        }

        this.checkEditButton = async (originalUrl) => {
            let li = document.body.querySelector(`#list-url > li`);
            const a = li.querySelector("a");
            const shortUrl = a.innerText.substring("localhost/".length);
            let button = li.querySelector("button");

            await button.click();

            li = document.body.querySelector(`#list-url > li`);

            const replacedA = li.querySelector("a");
            if (replacedA) return wrong("The link is not replaced with an input field after clicking the 'Edit' button.");

            const input = li.querySelector("input");
            if (!input) return wrong("The input field is missing after clicking the 'Edit' button.");

            const inputValue = input.value;
            if (inputValue !== shortUrl) return wrong("The input field does not have the correct initial value.");

            button = li.querySelector("button");
            const buttonText = button.innerText;
            if (buttonText !== "Save") return wrong("The 'Edit' button does not have the correct text after clicking it.");

            input.value = "elton";

            await button.click();

            li = document.body.querySelector(`#list-url > li`);

            const newA = li.querySelector("a");
            if (!newA) return wrong("The link is not displayed after clicking the 'Save' button.");

            const newAtext = newA.innerText;
            if (newAtext !== "localhost/elton") return wrong("The link does not have the correct text after clicking the 'Save' button.");

            const newAhref = newA.getAttribute("href");
            if (newAhref !== originalUrl) return wrong("The link does not have the correct href attribute after clicking the 'Save' button.");

            button = li.querySelector("button");
            const newButtonText = button.innerText;
            if (newButtonText !== "Edit") return wrong("The 'Save' button does not have the correct text after clicking it.");

            const newInput = li.querySelector("input");
            if (newInput) return wrong("The input field is not replaced with a link after clicking the 'Save' button.");

        }


        // CONSTANTS-->
        const theElement = "The element with the selector of";
        this.listUrl = "#list-url";
        // <--CONSTANTS

        // MESSAGES-->
        this.missingIdMsg = (id) => {
            return `${theElement} "${id}" is missing in the body of the HTML document.`;
        };
        this.wrongTagMsg = (id, tag, tagAlt) => {
            if (tagAlt) return `${theElement} "${id}" should be a/an ${tag} or ${tagAlt} tag.`;
            else return `${theElement} "${id}" should be a/an ${tag} tag.`;
        };
        this.wrongTextMsg = (id, text) => {
            return `${theElement} "${id}" should have the text: "${text}".`;
        };
        // <--MESSAGES
        return correct();

    }), this.page.execute(() => {
        // test #2
        // STAGE1 TAGS

        // check if h1 exists
        const h1 = "h1";
        if (this.elementExists(h1)) return wrong(this.missingIdMsg(h1));

        // check if correct text
        const h1Text = "URL Shortener";
        if (this.elementHasText(h1, h1Text)) return wrong(this.wrongTextMsg(h1, h1Text));

        // check if #input-url exists
        const inputUrl = "#input-url";
        if (this.elementExists(inputUrl)) return wrong(this.missingIdMsg(inputUrl));

        // check if its input
        if (this.elementExists(inputUrl, ["input"])) return wrong(this.wrongTagMsg(inputUrl, "input"));

        // check if it has placeholder
        const placeholder = "Enter a url";
        if (this.elementHasAttribute(inputUrl, "placeholder", placeholder))
            return wrong(`The "${inputUrl}" input should have the placeholder attribute with the value of "${placeholder}".`);

        // check if  #button-create exists
        const buttonCreate = "#button-create";
        if (this.elementExists(buttonCreate)) return wrong(this.missingIdMsg(buttonCreate));

        // check if its button
        if (this.elementExists(buttonCreate, ["button"])) return wrong(this.wrongTagMsg(buttonCreate, "button"));

        // check if it has text
        const buttonText = "Create";
        if (this.elementHasText(buttonCreate, buttonText))
            return wrong(this.wrongTextMsg(buttonCreate, buttonText));

        // check if #list-url exists
        if (this.elementExists(this.listUrl)) return wrong(this.missingIdMsg(this.listUrl));

        // check if its ol
        if (this.elementExists(this.listUrl, ["ol"])) return wrong(this.wrongTagMsg(this.listUrl, "ol"));

        return correct();

    }),
        this.node.execute(async () => {
            // test #3
            // check button click event
            const buttonCreate = "#button-create";
            const button = await this.page.findBySelector(buttonCreate);
            const input = await this.page.findBySelector("#input-url");
            const inputText = "https://upload.wikimedia.org/wikipedia/commons/2/21/Hello_World_Brian_Kernighan_1978.jpg";
            await input.inputText(inputText);

            let isEventFired = button.waitForEvent('click', 1000);
            await button.click();

            if (await !isEventFired) return wrong(`Expected click event on button with ${buttonCreate} id!`);

            await new Promise((resolve => {
                setTimeout(() => {
                    resolve();
                }, 1000)
            }));

            // check first link
            await this.page.evaluate(() => {
                const inputText = "https://upload.wikimedia.org/wikipedia/commons/2/21/Hello_World_Brian_Kernighan_1978.jpg";
                try {
                    return this.checkLink(1, inputText);
                }
                catch (e) {
                    return wrong("You should not reload the page after the button click.");
                }
            });

            const link1Selector = `#list-url > li:nth-child(1) a`;
            const link1 = await this.page.findBySelector(link1Selector);
            isEventFired = link1.waitForEvent('click', 1000);
            await link1.click();

            if (await !isEventFired) return wrong(`Expected click event on link with ${link1Selector} selector!`);

            await button.click();

            await new Promise((resolve => {
                setTimeout(() => {
                    resolve();
                }, 1000)
            }));

            // check another link
            await this.page.evaluate(() => {
                const inputText = "https://upload.wikimedia.org/wikipedia/commons/2/21/Hello_World_Brian_Kernighan_1978.jpg";
                return this.checkLink(2, inputText);
            });

            await this.page.evaluate(() => {
                return this.emptyInput();
            });

            // check if it can handle wrong input
            const wrongInput = "htps:/upload.wikimedia.org/wikipedia/commons/2/21/Hello_World_Brian_Kernighan_1978.jpg";
            await input.inputText(wrongInput);
            await button.click();

            await new Promise((resolve => {
                setTimeout(() => {
                    resolve();
                }, 1000)
            }));

            // check paragraph
            await this.page.evaluate(() => {
                return this.checkP();
            });

            return correct();

        }),
        this.node.execute(async () => {
            // test #4
            // check click counter
            const link1Selector = `#list-url > li:nth-child(1) a`;
            const link1 = await this.page.findBySelector(link1Selector);
            if (!link1) return wrong(`Do not remove the previously created links after a wrong input!`);

            await link1.click();
            await link1.click();

            await new Promise((resolve => {
                setTimeout(() => {
                    resolve();
                }, 1000)
            }));

            // check first link click counts
            await this.page.evaluate(() => {
                try {
                    return this.checkClickCounts(1, 3);
                }
                catch (e) {
                    return wrong("You should not reload the page or navigate to a different url on the same page after the link click.");
                }
            });

            return correct();

        }),
        this.node.execute(async () => {
            // test #4.1
            // check click counter
            const link2Selector = `#list-url > li:nth-child(2) a`;
            const link2 = await this.page.findBySelector(link2Selector);
            if (!link2) return wrong(`Do not remove the previously created links after a wrong input!`);

            await link2.click();
            await link2.click();

            await new Promise((resolve => {
                setTimeout(() => {
                    resolve();
                }, 1000)
            }));

            // check second link click counts
            await this.page.evaluate(() => {
                return this.checkClickCounts(2, 2);
            });

            return correct();
        }),
        this.page.execute(() => {
            // test #5
            // check if  #button-delete exists
            const buttonDelete = "#button-delete";
            if (this.elementExists(buttonDelete)) return wrong(this.missingIdMsg(buttonDelete));

            // check if its button
            if (this.elementExists(buttonDelete, ["button"])) return wrong(this.wrongTagMsg(buttonDelete, "button"));

            // check if it has text
            const buttonText = "Delete";
            if (this.elementHasText(buttonDelete, buttonText))
                return wrong(this.wrongTextMsg(buttonDelete, buttonText));

            return correct();
        }),
        this.node.execute(async () => {
            // test #6
            // check button click event
            await this.page.evaluate(() => {
                return this.emptyInput();
            });

            const buttonCreateSelector = "#button-create";
            const buttonCreate = await this.page.findBySelector(buttonCreateSelector);

            const input = await this.page.findBySelector("#input-url");
            const inputText = "https://en.wikipedia.org/wiki/I%27m_Still_Standing#/media/File:Elton_John_StillStanding.jpg";
            await input.inputText(inputText);

            await buttonCreate.click();

            await new Promise((resolve => {
                setTimeout(() => {
                    resolve();
                }, 1000)
            }));

            await this.page.evaluate(() => {
                return this.emptyInput();
            });

            await new Promise((resolve => {
                setTimeout(() => {
                    resolve();
                }, 1000)
            }));

            const deletedText = "https://upload.wikimedia.org/wikipedia/commons/2/21/Hello_World_Brian_Kernighan_1978.jpg";

            await input.inputText(deletedText);

            const buttonDeleteSelector = "#button-delete";
            const buttonDelete = await this.page.findBySelector(buttonDeleteSelector);
            let isEventFired = buttonDelete.waitForEvent('click', 1000);
            await buttonDelete.click();

            if (await !isEventFired) return wrong(`Expected click event on button with ${buttonDeleteSelector} id!`);

            await new Promise((resolve => {
                setTimeout(() => {
                    resolve();
                }, 1000)
            }));

            // check if inputted link deleted
            await this.page.evaluate(() => {
                const deletedText = "https://upload.wikimedia.org/wikipedia/commons/2/21/Hello_World_Brian_Kernighan_1978.jpg";
                try {
                    return this.checkInputLinkDeleted(deletedText);
                }
                catch (e) {
                    return wrong("You should not reload the page or navigate to a different url on the same page after the delete button click.");
                }            });

            await this.page.evaluate(() => {
                return this.emptyInput();
            });

            await new Promise((resolve => {
                setTimeout(() => {
                    resolve();
                }, 1000)
            }));

            await buttonDelete.click();

            await new Promise((resolve => {
                setTimeout(() => {
                    resolve();
                }, 1000)
            }));

            // check if all deleted
            await this.page.evaluate(() => {
                return this.checkListEmpty();
            });

            return correct();

        }),
        this.node.execute(async () => {
            // test #7
            // check button click event
            const buttonCreateSelector = "#button-create";
            const buttonCreate = await this.page.findBySelector(buttonCreateSelector);

            const input = await this.page.findBySelector("#input-url");
            const inputText = "https://en.wikipedia.org/wiki/I%27m_Still_Standing#/media/File:Elton_John_StillStanding.jpg";
            await input.inputText(inputText);

            await buttonCreate.click();

            await new Promise((resolve => {
                setTimeout(() => {
                    resolve();
                }, 1000)
            }));

            // check edit button
            await this.page.evaluate(() => {
                const inputText = "https://en.wikipedia.org/wiki/I%27m_Still_Standing#/media/File:Elton_John_StillStanding.jpg";
                try {
                    return this.checkEditButton(inputText);
                }
                catch (e) {
                    return wrong("You should not reload the page or navigate to a different url on the same page after the edit button click.");
                }
            });

            return correct();

        }),
        this.node.execute(async () => {
            // test #8
            // check click counter
            const link1Selector = `#list-url > li a`;
            const link1 = await this.page.findBySelector(link1Selector);
            let isEventFired = link1.waitForEvent('click', 1000);

            await link1.click();

            if (await !isEventFired) return wrong(`Expected click event on link with ${link1Selector} selector!`);

            await new Promise((resolve => {
                setTimeout(() => {
                    resolve();
                }, 1000)
            }));

            // check first link click counts
            await this.page.evaluate(() => {
                try {
                    return this.checkClickCounts(1, 1);
                }
                catch (e) {
                    return wrong("You should not reload the page or navigate to a different url on the same page after a link click.");
                }
            });

            return correct();

        }),
    ]

}

it("Test stage", async () => {
    await new Test().runTests()
}).timeout(30000);