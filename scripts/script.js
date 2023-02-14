document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const customer = document.querySelector('#customer');
    const freelancer = document.querySelector('#freelancer');
    const blockChoice = document.querySelector('#block-choice');
    const blockCustomer = document.querySelector('#block-customer');
    const blockFreelancer = document.querySelector('#block-freelancer');
    const btnExit = document.querySelector('#btn-exit');
    const formCustomer = document.querySelector('#form-customer');
    const ordersTable = document.querySelector('#orders');
    const modalOrder = document.querySelector('#order-read');
    const modalOrderActive = document.querySelector('#order-active');
    const theadDark = document.querySelector('.thead-dark');
    const orders = JSON.parse(localStorage.getItem('freeOrders')) || [];

    const toLocalStorage = () => {
        localStorage.setItem('freeOrders', JSON.stringify(orders));
    };

    const declOfNum = (number, titles) => { 
        return number + ' ' + titles[(number % 100 > 4 && number % 100 < 20) ? 
                                     2 : [2, 0, 1, 1, 1, 2][(number%10<5) ? number%10 : 5]]
    };

    const calcDeadline = (date) => {
        const deadline = new Date(date);
        const today = new Date();
        const remaining = (deadline - today) / 1000 / 60 / 60;
        if (remaining / 24 > 1) {
            return declOfNum(Math.floor(remaining / 24), ['день', 'дня', 'дней'])
        }
        return '< 1 дня'
    };

    const renderOrders = () => {
        ordersTable.innerHTML = '';
        orders.forEach((order, i) => {
            const taken = order.active ? 'taken' : '';

            ordersTable.innerHTML +=   `<tr class="order ${taken}" data-order="${i}">
                                            <td>${i+1}</td>
                                            <td>${order.description}</td>
                                            <td class="${order.currency}"></td>
                                            <td>${calcDeadline(order.deadline)}</td>
                                        </tr>`;
        });
    };

    const handlerModal = (event) => {
        const target = event.target;
        const modal = target.closest('.order-modal');
        const order = orders[modal.orderNumber];

        const baseAction = () => {
            modal.style.display = 'none';
            toLocalStorage();
            renderOrders();
        };

        if (target.closest('.close') || target === modal) {
            modal.style.display = 'none';
        }

        if (target.classList.contains('get-order')) {
            order.active = true;
            baseAction();
        }

        if (target.id === 'capitulation') {
            order.active = false;
            baseAction();
        }

        if (target.id === 'ready') {
            orders.splice(orders.indexOf(order), 1);
            baseAction();
        }
    };

    const openModal = (orderNumber) => {
        const { title, active, amount, currency, deadline, description, 
                email, firstName, phone } = orders[orderNumber];
        const modal = active ? modalOrderActive : modalOrder;
        modal.orderNumber = orderNumber;

        const titleBlock = modal.querySelector('.modal-title');
        const firstNameBlock = modal.querySelector('.firstName');
        const emailBlock = modal.querySelector('.email');
        const descriptionBlock = modal.querySelector('.description');
        const deadlineBlock = modal.querySelector('.deadline');
        const currencyBlock = modal.querySelector('.currency_img');
        const countBlock = modal.querySelector('.count');
        const phoneBlock = modal.querySelector('.phone');
        
        titleBlock.textContent = title;
        firstNameBlock.textContent = firstName;
        emailBlock.textContent = email;
        emailBlock.href = 'mailto:' + email;
        descriptionBlock.textContent = description;
        deadlineBlock.textContent = calcDeadline(deadline);
        currencyBlock.className = 'currency_img';
        currencyBlock.classList.add(currency);
        countBlock.textContent = amount;
        phoneBlock ? phoneBlock.href = 'tel:' + phone : '';

        modal.style.display = 'flex';

        modal.addEventListener('click', handlerModal);
    };

    const sortOrders = (arr, property) => {
        arr.sort((a, b) => a[property] > b[property] ? 1 : -1);
        toLocalStorage();
        renderOrders();
    };

    theadDark.addEventListener('click', (event) => {
        const target = event.target;

        if (target.classList.contains('head-sort')) {
            if (target.id === 'currency-head-sort') {
                sortOrders(orders, 'currency')
            }

            if (target.id === 'deadline-head-sort') {
                sortOrders(orders, 'deadline')
            }

            if (target.id === 'task-head-sort') {
                sortOrders(orders, 'title')
            }
        }
    });

    ordersTable.addEventListener('click', (event) => {
        const target = event.target;
        const targetOrder = target.closest('.order')

        if (targetOrder) {
            openModal(targetOrder.dataset.order);
        }
    });

    customer.addEventListener('click', () => {
        blockChoice.style.display = 'none';
        const today = new Date().toISOString().substring(0, 10);
        document.querySelector('#deadline').min = today;
        blockCustomer.style.display = 'block';
        btnExit.style.display = 'block';
    });

    freelancer.addEventListener('click', () => {
        blockChoice.style.display = 'none';
        renderOrders();
        blockFreelancer.style.display = 'block';
        btnExit.style.display = 'block';      
    });

    btnExit.addEventListener('click', () => {
        btnExit.style.display = 'none';
        blockFreelancer.style.display = 'none';
        blockCustomer.style.display = 'none';
        blockChoice.style.display = 'block';
    });

    formCustomer.addEventListener('submit', (event) => {
        event.preventDefault();

        const obj = {};

        for (const elem of formCustomer.elements) {

            if ((elem.tagName === 'INPUT' && elem.type !== 'radio') || 
            (elem.type === 'radio' && elem.checked) || 
            (elem.tagName === 'TEXTAREA')) {
                obj[elem.name] = elem.value;
            }
        }

        obj.active = false;
        formCustomer.reset();
        orders.push(obj);
        toLocalStorage();
    });
});