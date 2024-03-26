function onCreateURL(e) {
    e.preventDefault();

    const previousP = document.querySelector('p');
    if (previousP) {
        previousP.remove();
    }

    const regex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
    const url = document.getElementById('input-url').value.replace(/\\/g, "");
    const result = regex.test(url);
    if (!result) {
        const p = document.createElement('p');
        p.textContent = 'Please enter a valid url';
        document.body.appendChild(p);
        return;
    }

    const length = 5;
    const randomURL = Math.random().toString(36).substring(2, length);

    const list = document.getElementById('list-url');

    const newItem = document.createElement('li');
    newItem.setAttribute('data-url', url);
    newItem.setAttribute('data-short-url', randomURL);

    const countEl = document.createElement('span');
    countEl.setAttribute('data-clicks-counter', "0");

    newItem.innerHTML = `<a href="${url}" target="_blank" 
        onclick="onClickURL('${randomURL}')">localhost/${randomURL}</a> 
        - ${url} 
        - <span id="${randomURL}" data-clicks-counter="0">Clicks: 0</span>`;

    const editBtn = document.createElement('button');
    editBtn.addEventListener('click', () => onEditURL(randomURL));
    editBtn.id = `${randomURL}-edit-btn`;
    editBtn.textContent = 'Edit';

    newItem.appendChild(editBtn);
    list.appendChild(newItem);

    document.getElementById('my-form').reset();
}

function onClickURL(url) {
    const el = document.getElementById(url);
    const counter = +el.getAttribute('data-clicks-counter') + 1;
    el.setAttribute('data-clicks-counter', counter.toString());
    el.innerHTML = `Clicks: ${counter}`;
}


function onDeleteURL() {
    const searchValue = document.getElementById('input-url').value.trim().replace(/\\/g, "");

    if (!searchValue) {
        const elementList = document.getElementById('list-url');
        elementList.replaceChildren();
        return;
    }

    const dataUrlList = document.querySelectorAll(`li[data-url="${searchValue}"]`);
    if (dataUrlList.length) {
        dataUrlList.forEach(item => item.remove());
        document.getElementById('my-form').reset();
        return;
    }

    const dataShortUrlList = document.querySelectorAll(`li[data-short-url="${searchValue}"]`);
    if (dataShortUrlList.length) {
        dataShortUrlList.forEach(item => item.remove());
        document.getElementById('my-form').reset();
    }
}

function onEditURL(shortURL) {
    const element = document.querySelector(`li[data-short-url="${shortURL}"]`);
    const anchorEl = element.querySelector('a');
    const editBtn = element.querySelector('button');

    const inputEl = document.createElement('input');
    inputEl.value = shortURL;
    inputEl.type = 'text';
    inputEl.placeholder = 'Enter a URL';
    element.prepend(inputEl);
    anchorEl.style.display = 'none';
    //element.replaceChild(inputEl, anchorEl);

    const saveBtn = document.createElement('button');
    saveBtn.addEventListener('click', () => onSaveURL(inputEl.value, shortURL));
    saveBtn.textContent = 'Save';
    saveBtn.id = `${shortURL}-save-btn`;
    editBtn.style.display = 'none';
    element.appendChild(saveBtn);
}

function onSaveURL(newUrl, shortURL) {
    const element = document.querySelector(`li[data-short-url="${shortURL}"]`);
    element.setAttribute('data-short-url', newUrl)

    const anchorEl = element.querySelector('a');
    anchorEl.addEventListener('click', () => onClickURL(newUrl));
    anchorEl.textContent = `localhost/${newUrl}`;
    anchorEl.style.display = '';

    const inputEl = element.querySelector('input');
    inputEl.remove();

    const editBtn = document.getElementById(`${shortURL}-edit-btn`);
    editBtn.id = `${newUrl}-edit-btn`;
    editBtn.addEventListener('click', () => onEditURL(newUrl));
    editBtn.style.display = '';

    const saveBtn = document.getElementById(`${shortURL}-save-btn`);
    saveBtn.remove();
}