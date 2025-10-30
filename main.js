const SERVER_API = 'http://localhost:3000';

let button = document.getElementById('button')
let delbutton = document.createElement('button');
let enbutton = document.createElement('button');
enbutton.classList.add("btn","btn-success","mr-2");

let cancel= document.getElementById('contact__cancel');

delbutton.classList.add("btn","btn-danger");
enbutton.textContent="Изменить"
delbutton.textContent="Удалить";

let btns = document.querySelectorAll('button');
btns.forEach(btn => {
  btn.addEventListener('click',  (e) => {
     e.preventDefault();
  });
});

// Модальные окна
let modal = document.getElementById("myModal");
let modalChange = document.getElementById("myModal-change");
let btn = document.getElementById("add");
let span = document.getElementsByClassName("close")[0];
let spanChange = document.getElementsByClassName("close")[1];
 
// Открытие модального окна добавления клиента
btn.onclick = function () {
  modal.style.display = "block";
};
 
// Закрытие модальных окон
span.onclick = function () {
  modal.style.display = "none";
};

spanChange.onclick = function () {
  modalChange.style.display = "none";
};
 
// Закрытие модальных окон по клику вне поля
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
  if (event.target == modalChange) {
    modalChange.style.display = "none";
  }
};

modalChange.style.display = "none";

let students=[];
let contacts=[];
let IdArr=[];
let objects=[]
let obj={};

let containers = document.createElement('span')
let vk = document.createElement('img');
let fb = document.createElement('img');
let mail = document.createElement('img');
let phone = document.createElement('img');
let add = document.createElement('img');

vk.src = "img/vk.png";
fb.src = "img/fb.png";
mail.src = "img/mail.png";
phone.src = "img/phone.png";
add.src = "img/add.png";

vk.classList.add('link')
fb.classList.add('link')
mail.classList.add('link')
phone.classList.add('link')
add.classList.add('link')

let social=[]

//Для сортировки
let sortField = 'id';
let sortDirection = 'asc';
let cachedStudents = [];




// Получение данных с сервера
async function serverGetStudents() {
  let response = await fetch(SERVER_API + '/api/clients', {
      method: "GET",
      headers: {'Content-Type': 'application/json'},
 })
  let data = await response.json()
  cachedStudents = data;
  return data
}

let serverData = await serverGetStudents();

if(serverData){
 students=serverData;
}

for(let item of serverData){
  IdArr.push(item.id)
}

// Функция для форматирования даты
function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

// Функция для создания иконок контактов
function createContactIcons(contactsArray) {
  const container = document.createElement('div');
  container.classList.add('contacts-container');
  
  contactsArray.forEach(contact => {
    const iconWrapper = document.createElement('div');
    iconWrapper.classList.add('contact-icon');
    iconWrapper.setAttribute('data-tooltip', `${contact.type}: ${contact.value}`);
    
    let icon;
    switch(contact.type) {
      case 'VK':
        icon = vk.cloneNode(true);
        break;
      case 'Facebook':
        icon = fb.cloneNode(true);
        break;
      case 'Телефон':
        icon = phone.cloneNode(true);
        break;
      case 'Почта':
        icon = mail.cloneNode(true);
        break;
      case 'Дополнительно':
        icon = add.cloneNode(true);
        break;
      default:
        icon = add.cloneNode(true);
    }
    
    iconWrapper.appendChild(icon);
    container.appendChild(iconWrapper);
  });
  
  return container;
}

// Функция для добавления поля контакта
function addContactField(containerId, isChangeModal = false) {
  const container = document.getElementById(containerId);
  const contactField = document.createElement('div');
  contactField.classList.add('contact-field', 'mb-2', 'd-flex', 'align-items-center');
  
  const select = document.createElement('select');
  select.classList.add('form-control', 'mr-2', 'contact-type');
  select.innerHTML = `
    <option value="Телефон">Телефон</option>
    <option value="Почта">Почта</option>
    <option value="VK">VK</option>
    <option value="Facebook">Facebook</option>
    <option value="Дополнительно">Дополнительно</option>
  `;
  
  const input = document.createElement('input');
  input.type = "text";
  input.classList.add('form-control', 'mr-2', 'contact-value');
  input.placeholder = "Введите значение";
  
  const removeBtn = document.createElement('button');
  removeBtn.type = "button";
  removeBtn.classList.add('btn', 'btn-outline-danger', 'contact-remove');
  removeBtn.innerHTML = "×";
  removeBtn.addEventListener('click', function() {
    contactField.remove();
  });
  
  contactField.appendChild(select);
  contactField.appendChild(input);
  contactField.appendChild(removeBtn);
  container.appendChild(contactField);
}

// Функция для получения данных контактов из формы
function getContactsFromForm(containerId) {
  const contactFields = document.querySelectorAll(`#${containerId} .contact-field`);
  const contacts = [];
  
  contactFields.forEach(field => {
    const type = field.querySelector('.contact-type').value;
    const value = field.querySelector('.contact-value').value.trim();
    
    if (value) {
      contacts.push({ type, value });
    }
  });
  
  return contacts;
}

// Функция для заполнения формы контактами
function fillContactsForm(containerId, contacts) {
  const container = document.getElementById(containerId);
  // Очищаем существующие поля контактов
  container.querySelectorAll('.contact-field').forEach(field => field.remove());
  
  // Добавляем поля для каждого контакта
  contacts.forEach(contact => {
    addContactField(containerId);
    const lastField = container.querySelector('.contact-field:last-child');
    lastField.querySelector('.contact-type').value = contact.type;
    lastField.querySelector('.contact-value').value = contact.value;
  });
}

// Рендер таблицы клиентов
async function renderStudentsTable(studentsArray) {
  const list = document.getElementById('list');
  list.innerHTML = ''; // Очищаем таблицу перед рендером
  
  for(let item of studentsArray) {
    let tr = document.createElement('tr');
    
    // Используем оригинальные даты из сервера
    const createdAt = formatDate(item.createdAt || new Date().toISOString());
    const updatedAt = formatDate(item.updatedAt || new Date().toISOString());

 
    
    const formattedCreated = formatDate(createdAt);
    const formattedUpdated = formatDate(updatedAt);
    
    // Для отладки можно посмотреть оригинальные даты
    if (sortField === 'created' || sortField === 'modified') {
      tr.setAttribute('data-created', createdAt);
      tr.setAttribute('data-updated', updatedAt);
    }
   
   
   
    // Создаем иконки контактов
    const contactsContainer = createContactIcons(item.contacts);

    for (let i=1; i<=6; i++) {
      let td= document.createElement('td');
      td.setAttribute('id',i);
     
      if(td.id ==1) {td.append(item.id)}
      if(td.id ==2) {td.textContent =`${item.surname} ${item.name} ${item.lastName}`}
      if(td.id ==3) {td.textContent = createdAt} // Оригинальная дата создания
      if(td.id ==4) {td.textContent = updatedAt} // Оригинальная дата изменения
      if(td.id ==5) {td.append(contactsContainer)}
      
    
      // Кнопки действий
      if(td.id ==6) {
        const editBtn = enbutton.cloneNode(true);
        const deleteBtn = delbutton.cloneNode(true);
        
        editBtn.setAttribute('data-id', item.id);
        deleteBtn.setAttribute('data-id', item.id);
        
        editBtn.addEventListener('click', function() {
          openEditModal(item.id);
        });
        
        deleteBtn.addEventListener('click', function() {
          deleteClient(item.id);
        });
        
        td.append(editBtn);
        td.append(deleteBtn);
      }
      
      tr.append(td);
      list.append(tr);
    }
  }
}

// Открытие модального окна редактирования
async function openEditModal(clientId) {
  const client = await serverGetIdClientss(clientId);
  modalChange.style.display = "block";
  
  // Заполняем поля формы
  document.getElementById('name-change').value = client.name;
  document.getElementById('surname-change').value = client.surname;
  document.getElementById('lastName-change').value = client.lastName;
  
  // Заполняем контакты
  fillContactsForm('modal__buttons-change', client.contacts);
  
  // Сохраняем ID клиента и оригинальную дату создания
  document.getElementById('save-change').setAttribute('data-client-id', clientId);
  document.getElementById('save-change').setAttribute('data-created-at', client.createdAt);
}

// Удаление клиента
async function deleteClient(clientId) {
  if (confirm('Вы уверены, что хотите удалить этого клиента?')) {
    await serverDeleteStudents(clientId);
    // Обновляем таблицу
    const updatedData = await serverGetStudents();
    //await renderStudentsTable(updatedData);
    const sortedData = applySorting(updatedData, sortField, sortDirection);
    await renderStudentsTable(sortedData);
    refreshSortIndicators();
  }
}

// Добавление нового клиента
async function addNewClient() {
  const name = document.getElementById('name').value.trim();
  const surname = document.getElementById('surname').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  
  // Проверка обязательных полей
  if (!name || !surname || !lastName) {
    alert('Пожалуйста, заполните все обязательные поля (имя, фамилия, отчество)');
    return;
  }
  
  const contacts = getContactsFromForm('modal__buttons');
  
  const clientData = {
    name,
    surname,
    lastName,
    contacts,
  };
  
  try {
    const newClient = await serverAddClients(clientData);
    modal.style.display = "none";
    
    // Очищаем форму
    document.getElementById('name').value = '';
    document.getElementById('surname').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('modal__buttons').querySelectorAll('.contact-field').forEach(field => field.remove());
    
    // Обновляем таблицу
    const updatedData = await serverGetStudents();
     const sortedData = applySorting(updatedData, sortField, sortDirection);
    //await renderStudentsTable(updatedData);
    await renderStudentsTable(sortedData);
    refreshSortIndicators();
  } catch (error) {
    console.error('Ошибка при добавлении клиента:', error);
    alert('Произошла ошибка при добавлении клиента');
  }
}

// Редактирование клиента
async function saveClientChanges() {
  const clientId = document.getElementById('save-change').getAttribute('data-client-id');
  const originalCreatedAt = document.getElementById('save-change').getAttribute('data-created-at');
  const name = document.getElementById('name-change').value.trim();
  const surname = document.getElementById('surname-change').value.trim();
  const lastName = document.getElementById('lastName-change').value.trim();
  
  // Проверка обязательных полей
  if (!name || !surname || !lastName) {
    alert('Пожалуйста, заполните все обязательные поля (имя, фамилия, отчество)');
    return;
  }
  
  const contacts = getContactsFromForm('modal__buttons-change');
  
  const clientData = {
    name,
    surname,
    lastName,
    contacts,
    // Сохраняем оригинальную дату создания
    createdAt: originalCreatedAt,
    // updatedAt будет обновлена автоматически на сервере
  };
  
  try {
    await serverChangeClients(clientData, clientId);
    modalChange.style.display = "none";
    
    // Обновляем таблицу
    const updatedData = await serverGetStudents();
    //await renderStudentsTable(updatedData);
    const sortedData = applySorting(updatedData, sortField, sortDirection);
    await renderStudentsTable(sortedData);
    refreshSortIndicators();

  } catch (error) {
    console.error('Ошибка при обновлении клиента:', error);
    alert('Произошла ошибка при обновлении данных клиента');
  }
}

// API функции
async function serverAddClients(clientData) {
  let response = await fetch(SERVER_API + '/api/clients', {
      method: "POST",
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(clientData)
  });
  let data = await response.json();
  return data;
}

async function serverDeleteStudents(id) {
  let response = await fetch(SERVER_API + `/api/clients/${id}`, {
      method: "DELETE",
  });
  let data = await response.json();
  return data;
}

async function serverGetIdClientss(id) {
  let response = await fetch(SERVER_API + `/api/clients/${id}`, {
    method: "GET",
    headers: {'Content-Type': 'application/json'},
  });
  let data = await response.json();
  return data;
}

async function serverChangeClients(clientData, id) {
  let response = await fetch(SERVER_API + `/api/clients/${id}`, {
      method: "PATCH",
      body: JSON.stringify(clientData),
      headers: {'Content-Type': 'application/json'}
  });
  let data = await response.json();
  return data;
}

// Инициализация
await renderStudentsTable(students);

// Обработчики событий
document.getElementById('save').addEventListener('click', addNewClient);
document.getElementById('save-change').addEventListener('click', saveClientChanges);
document.getElementById('cancel').addEventListener('click', function() {
  modal.style.display = "none";
});
document.getElementById('cancel-change').addEventListener('click', function() {
  modalChange.style.display = "none";
});

// Добавление полей контактов
document.getElementById('adds').addEventListener('click', function() {
  addContactField('modal__buttons');
});

document.getElementById('adds-change').addEventListener('click', function() {
  addContactField('modal__buttons-change', true);
});

// Поиск
function filterTable() {
  let search = document.getElementById("find").value.toUpperCase().trim();
  let rows = document.getElementById("list").getElementsByTagName("tr");
   for (let i = 0; i < rows.length; i++) {
    let firstColumnContent = rows[i].textContent.toUpperCase();
    rows[i].style.display = firstColumnContent.includes(search) ? "" : "none";
  }
}

document.getElementById('find').addEventListener('keyup', filterTable);

///Сортировка по таблице

// Добавляем переменные для сортировки

// ... существующий код ...

// Функция сортировки
function applySorting(data, field, direction) {
  const sorted = [...data].sort((a, b) => {
    let valA, valB;
    
    switch(field) {
      case 'id':
        valA = a.id;
        valB = b.id;
        break;
      case 'fio':
        valA = `${a.surname} ${a.name} ${a.lastName}`.toLowerCase();
        valB = `${b.surname} ${b.name} ${b.lastName}`.toLowerCase();
        break;
      case 'created':
        valA = new Date(a.createdAt || a.createdat).getTime();
        valB = new Date(b.createdAt || b.createdat).getTime();
        break;
      case 'modified':
        valA = new Date(a.updatedAt || a.updatedat).getTime();
        valB = new Date(b.updatedAt || b.updatedat).getTime();
        break;
      default:
        return 0;
    }
    
    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });
  
  return sorted;
}

// Обновление индикаторов сортировки
function refreshSortIndicators() {
  const headers = document.querySelectorAll('.head__item');
  headers.forEach(header => {
    const icon = header.querySelector('svg');
    if (!icon) return;
    
    icon.style.opacity = '0.7';
    const paths = icon.querySelectorAll('path');
    paths.forEach(path => {
      path.style.fill = '#9873FF';
    });
    
    let type = '';
    if (header.textContent.includes('ID')) type = 'id';
    else if (header.textContent.includes('Фамилия имя отчество')) type = 'fio';
    else if (header.textContent.includes('Дата и время создания')) type = 'created';
    else if (header.textContent.includes('Последние изменения')) type = 'modified';
    
    if (type === sortField) {
      icon.style.opacity = '1';
      const paths = icon.querySelectorAll('path');
      paths.forEach(path => {
        path.style.fill = sortDirection === 'asc' ? '#9873FF' : '#7B61FF';
      });
      
      // Поворачиваем стрелку для нисходящей сортировки
      if (sortDirection === 'desc') {
        icon.style.transform = 'rotate(180deg)';
      } else {
        icon.style.transform = 'rotate(0deg)';
      }
    }
  });
}

// Обработчик клика по заголовку
function setupHeaderClick(header, type) {
  header.style.cursor = 'pointer';
  header.addEventListener('click', () => {
    if (sortField === type) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortField = type;
      sortDirection = 'asc';
    }
    
    // Для дат используем сортировку по timestamp
    const sortedData = applySorting(cachedStudents, sortField, sortDirection);
    renderStudentsTable(sortedData);
    refreshSortIndicators();
    
    // Логируем для отладки
 
}
  )}

// Инициализация сортировки
function initSorting() {
  const headers = document.querySelectorAll('.head__item');

  headers.forEach(header => {
    if (header.textContent.includes('ID')) {
      setupHeaderClick(header, 'id');
    } else if (header.textContent.includes('Фамилия имя отчество')) {
      setupHeaderClick(header, 'fio');
    } else if (header.textContent.includes('Дата и время создания')) {
      setupHeaderClick(header, 'created');
    } else if (header.textContent.includes('Последние изменения')) {
      setupHeaderClick(header, 'modified');
    }
  });
}


// Инициализируем сортировку после загрузки данных
initSorting();
const initiallySorted = applySorting(students, sortField, sortDirection);
await renderStudentsTable(initiallySorted);
refreshSortIndicators();




// Сортировка по дате создания и изменения
// Функция для получения корректного значения даты из элемента таблицы
function sortTableByDate(columnIndex, isCreatedDate) {
  const table = document.getElementById('list');
  const rows = Array.from(table.rows);
  
  const sortedRows = rows.sort((a, b) => {
    const dateA = getDateFromTableCell(a, columnIndex);
    const dateB = getDateFromTableCell(b, columnIndex);
    
    if (sortDirection === 'asc') {
      return dateA - dateB;
    } else {
      return dateB - dateA;
    }
  });
  
  // Очищаем таблицу и добавляем отсортированные строки
  table.innerHTML = '';
  sortedRows.forEach(row => table.appendChild(row));
}

// Обновляем обработчик клика для дат


