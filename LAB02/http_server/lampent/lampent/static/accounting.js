"use strict";
function setEquals(a, b) {
    if (a.size !== b.size) {
        return false;
    }
    for (const value of a) {
        if (!b.has(value)) {
            return false;
        }
    }
    return true;
}
function isObject(o) {
    return typeof o === 'object' && o !== null && !Array.isArray(o);
}
class radacct {
    radacctid;
    acctsessionid;
    acctuniqueid;
    username;
    nasipaddress;
    acctstarttime;
    acctupdatetime;
    acctstoptime;
    acctsessiontime;
    acctinputoctets;
    acctoutputoctets;
    constructor(radacctid, acctsessionid, acctuniqueid, username, nasipaddress, acctstarttime, acctupdatetime, acctstoptime, acctsessiontime, acctinputoctets, acctoutputoctets) {
        this.radacctid = radacctid;
        this.acctsessionid = acctsessionid;
        this.acctuniqueid = acctuniqueid;
        this.username = username;
        this.nasipaddress = nasipaddress;
        this.acctstarttime = acctstarttime;
        this.acctupdatetime = acctupdatetime;
        this.acctstoptime = acctstoptime;
        this.acctsessiontime = acctsessiontime;
        this.acctinputoctets = acctinputoctets;
        this.acctoutputoctets = acctoutputoctets;
    }
}
function assertString(o) {
    if (typeof o !== 'string') {
        throw new Error();
    }
    return o;
}
function assertStringOrNull(o) {
    if (o === null || typeof o === 'string') {
        return o;
    }
    throw new Error();
}
function assertNumberOrNull(o) {
    if (o === null || typeof o === 'number') {
        return o;
    }
    throw new Error();
}
function assertNumber(o) {
    if (typeof o !== 'number') {
        throw new Error();
    }
    return o;
}
async function* accounting(username) {
    const url = new URL('/api/accounting', window.location.origin);
    if (username !== null) {
        url.searchParams.append('username', username);
    }
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error();
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
        throw new Error();
    }
    for (const item of data) {
        if (!isObject(item)) {
            throw new Error();
        }
        if (!setEquals(new Set(Object.keys(item)), new Set(['radacctid', 'acctsessionid', 'acctuniqueid', 'username', 'nasipaddress', 'acctstarttime', 'acctupdatetime', 'acctstoptime', 'acctsessiontime', 'acctinputoctets', 'acctoutputoctets']))) {
            throw new Error();
        }
        yield new radacct(assertNumber(item['radacctid']), assertString(item['acctsessionid']), assertString(item['acctuniqueid']), assertString(item['username']), assertString(item['nasipaddress']), assertStringOrNull(item['acctstarttime']), assertStringOrNull(item['acctupdatetime']), assertStringOrNull(item['acctstoptime']), assertNumberOrNull(item['acctsessiontime']), assertNumberOrNull(item['acctinputoctets']), assertNumberOrNull(item['acctoutputoctets']));
    }
}
class Pineco {
    document;
    tableHead;
    tableBody;
    username;
    constructor(document, tableHead, tableBody, username) {
        this.document = document;
        this.tableHead = tableHead;
        this.tableBody = tableBody;
        this.username = username;
    }
    setTableHead() {
        const tableRow = this.document.createElement('tr');
        for (const content of ['radacctid', 'acctsessionid', 'acctuniqueid', 'username', 'nasipaddress', 'acctstarttime', 'acctupdatetime', 'acctstoptime', 'acctsessiontime', 'acctinputoctets', 'acctoutputoctets']) {
            const tableHeader = this.document.createElement('th');
            tableHeader.textContent = content;
            tableRow.appendChild(tableHeader);
        }
        this.tableHead.replaceChildren(tableRow);
    }
    async setTableBody() {
        const children = [];
        for await (const item of accounting(this.username)) {
            const tableRow = this.document.createElement('tr');
            const document = this.document;
            function appendChild(textContent) {
                const tableDataCell = document.createElement('td');
                tableDataCell.textContent = textContent;
                tableRow.appendChild(tableDataCell);
            }
            function toStringOrNull(o) {
                if (o === null) {
                    return o;
                }
                return o.toString();
            }
            appendChild(item.radacctid.toString());
            appendChild(item.acctsessionid);
            appendChild(item.acctuniqueid);
            appendChild(item.username);
            appendChild(item.nasipaddress);
            appendChild(item.acctstarttime);
            appendChild(item.acctupdatetime);
            appendChild(item.acctstoptime);
            appendChild(toStringOrNull(item.acctsessiontime));
            appendChild(toStringOrNull(item.acctinputoctets));
            appendChild(toStringOrNull(item.acctoutputoctets));
            children.push(tableRow);
        }
        this.tableBody.replaceChildren(...children);
    }
}
async function currentUser() {
    const response = await fetch('/api/current_user');
    const username = await response.json();
    const item = document.createElement('div');
    item.classList.add('navbar-item');
    if (typeof username === 'string') {
        item.textContent = username;
    }
    else if (username === null) {
    }
    else {
        throw new Error();
    }
    const contentSpan = document.createElement('span');
    contentSpan.replaceChildren(item);
    return contentSpan;
}
class NavigationBar {
    element;
    end;
    constructor(element, end) {
        this.element = element;
        this.end = end;
    }
}
async function createNavigationBar() {
    const block = document.createElement('div');
    block.classList.add('block');
    const navigationBar = document.createElement('nav');
    navigationBar.classList.add('navbar');
    navigationBar.role = 'navigation';
    navigationBar.ariaLabel = 'main navigation';
    const menu = document.createElement('div');
    menu.classList.add('navbar-menu');
    const start = document.createElement('div');
    start.classList.add('navbar-start');
    const items = [
        ['/', '首頁', 'index'],
        ['/register', '使用者註冊', 'register'],
        ['/login', '使用者登入', 'login'],
        ['/logout', '使用者登出', 'logout'],
        ['/accounting', '顯示使用者流量與使用時間的功能', 'accounting'],
    ];
    for (const [url, textContent, name] of items) {
        const item = document.createElement('a');
        item.classList.add('navbar-item');
        item.href = url;
        item.textContent = textContent;
        start.appendChild(item);
    }
    const end = document.createElement('div');
    end.replaceChildren(await currentUser());
    menu.replaceChildren(start, end);
    navigationBar.replaceChildren(menu);
    block.replaceChildren(navigationBar);
    return new NavigationBar(block, end);
}
function main() {
    document.addEventListener('DOMContentLoaded', async (event) => {
        const genericSection = document.createElement('section');
        genericSection.classList.add('section');
        const contentDivsion = document.createElement('div');
        contentDivsion.classList.add('container', 'is-fluid');
        const main = document.createElement('main');
        const title = document.createElement('h1');
        title.classList.add('title');
        title.textContent = '顯示使用者流量與使用時間的功能';
        const block = document.createElement('div');
        block.classList.add('block');
        const table = document.createElement('table');
        table.classList.add('table', 'is-fullwidth');
        const pineco = new Pineco(document, document.createElement('thead'), document.createElement('tbody'), null);
        pineco.setTableHead();
        try {
            await pineco.setTableBody();
        }
        catch (error) {
            console.error(error);
        }
        table.replaceChildren(pineco.tableHead, pineco.tableBody);
        block.replaceChildren(table);
        main.replaceChildren(title, block);
        const navigationBar = await createNavigationBar();
        contentDivsion.replaceChildren(navigationBar.element, main);
        genericSection.replaceChildren(contentDivsion);
        document.body.replaceChildren(genericSection);
    });
}
main();
