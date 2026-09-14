const form = document.querySelector('[data-calculator-form]');
const nameInput = document.querySelector('[data-calc-name]');
const dateInput = document.querySelector('[data-calc-date]');
const errorBox = document.querySelector('[data-calc-error]');
const result = document.querySelector('[data-calc-result]');
const personName = document.querySelector('[data-person-name]');
const personDate = document.querySelector('[data-person-date]');
const healthBody = document.querySelector('[data-health-body]');
const programs = document.querySelector('[data-programs]');

const meanings = {
  1: 'ініціатива, самостійність, здатність починати нове',
  2: 'чутливість, партнерство, дипломатичність',
  3: 'творчість, слово, проявленість',
  4: 'структура, дисципліна, опора',
  5: 'навчання, цінності, передача знань',
  6: 'вибір, любов, гармонія у стосунках',
  7: 'рух, воля, перемоги через дію',
  8: 'баланс, справедливість, відповідальність',
  9: 'мудрість, глибина, потреба в усамітненні',
  10: 'цикли, зміни, вміння ловити можливості',
  11: 'сила, харизма, внутрішній ресурс',
  12: 'новий погляд, терпіння, служіння',
  13: 'трансформація, завершення старого, оновлення',
  14: 'помірність, зцілення, мʼяке вирівнювання',
  15: 'матеріальність, бажання, робота з привʼязаностями',
  16: 'звільнення від ілюзій, чесність із собою',
  17: 'натхнення, публічність, віра у свій шлях',
  18: 'інтуїція, підсвідомість, робота зі страхами',
  19: 'сонячність, радість, визнання',
  20: 'рід, покликання, пробудження сили',
  21: 'масштаб, світ, завершеність',
  22: 'свобода, новий досвід, нестандартність',
};

const healthRows = [
  ['Сахасрара', 'Місія'],
  ['Аджна', 'Доля, егрегори'],
  ['Вішудха', 'Самосприйняття'],
  ['Анахата', 'Стосунки'],
  ['Маніпура', 'Соціум, гроші'],
  ['Свадхістана', 'Радість'],
  ['Муладхара', 'Тіло, матерія'],
  ['Сума', 'Загальне поле'],
];

function digitSum(value) {
  return String(value).replace(/\D/g, '').split('').reduce((sum, digit) => sum + Number(digit), 0);
}

function reduce22(value) {
  let resultValue = Number(value);

  while (resultValue > 22) {
    resultValue = digitSum(resultValue);
  }

  return resultValue || 22;
}

function parseDate(value) {
  const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return { day, month, year };
}

function getAge({ day, month, year }) {
  const today = new Date();
  let age = today.getFullYear() - year;
  const monthDiff = today.getMonth() + 1 - month;

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
    age -= 1;
  }

  return age;
}

function calculateMatrix(date) {
  const day = reduce22(date.day);
  const month = reduce22(date.month);
  const year = reduce22(digitSum(date.year));
  const personality = reduce22(day + month + year);
  const center = reduce22(day + month + year + personality);

  const search = reduce22(center + year);
  const social = reduce22(center + personality);
  const comfort = reduce22(search + social);
  const maleLine = reduce22(day + center);
  const femaleLine = reduce22(month + center);
  const innerPower = reduce22(comfort + center);
  const clanPower = reduce22(maleLine + femaleLine);
  const spiritual = reduce22(year + search);
  const planetary = reduce22(personality + social);
  const money = reduce22(day + month + personality);
  const relation = reduce22(month + year + center);
  const talent = reduce22(day + year);
  const body = reduce22(day + month);
  const decade0 = day;
  const decade10 = reduce22(day + year);
  const decade20 = year;
  const decade30 = reduce22(year + personality);
  const decade40 = personality;
  const decade50 = reduce22(personality + month);
  const decade60 = month;
  const decade70 = reduce22(month + day);
  const partner = reduce22(relation + comfort);
  const moneyCode = reduce22(money + innerPower);
  const resource = reduce22(center + clanPower);
  const sky = reduce22(year + spiritual);
  const earth = reduce22(body + money);
  const ageCycle = [
    reduce22(day + 9),
    reduce22(decade10 + 4),
    reduce22(decade10 + 7),
    reduce22(year + 8),
    reduce22(year + 15),
    reduce22(decade30 + 8),
    reduce22(decade30 + 9),
    reduce22(personality + 5),
    reduce22(personality + 12),
    reduce22(decade50 + 7),
    reduce22(decade50 + 11),
    reduce22(month + 10),
    reduce22(month + 5),
    reduce22(decade70 + 19),
    reduce22(decade70 + 14),
    reduce22(day + 22),
  ];

  const health = [
    [year, search, spiritual],
    [talent, year, reduce22(talent + year)],
    [personality, social, reduce22(personality + social)],
    [relation, comfort, reduce22(relation + comfort)],
    [money, center, reduce22(money + center)],
    [month, femaleLine, reduce22(month + femaleLine)],
    [body, maleLine, reduce22(body + maleLine)],
  ];

  const healthTotal = [
    reduce22(health.reduce((sum, row) => sum + row[0], 0)),
    reduce22(health.reduce((sum, row) => sum + row[1], 0)),
    reduce22(health.reduce((sum, row) => sum + row[2], 0)),
  ];

  health.push(healthTotal);

  return {
    day,
    month,
    year,
    personality,
    center,
    search,
    social,
    comfort,
    maleLine,
    femaleLine,
    innerPower,
    clanPower,
    spiritual,
    planetary,
    money,
    relation,
    talent,
    body,
    decade0,
    decade10,
    decade20,
    decade30,
    decade40,
    decade50,
    decade60,
    decade70,
    partner,
    moneyCode,
    resource,
    sky,
    earth,
    ageCycle,
    health,
  };
}

function setText(selector, value) {
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = value;
  }
}

function renderMatrix(matrix, date) {
  setText('[data-point="top"]', matrix.year);
  setText('[data-point="left"]', matrix.day);
  setText('[data-point="right"]', matrix.personality);
  setText('[data-point="bottom"]', matrix.month);
  setText('[data-point="center"]', matrix.center);
  setText('[data-point="comfort"]', matrix.comfort);
  setText('[data-point="search"]', matrix.search);
  setText('[data-point="social"]', matrix.social);
  setText('[data-point="male"]', matrix.maleLine);
  setText('[data-point="female"]', matrix.femaleLine);
  setText('[data-point="inner"]', matrix.innerPower);
  setText('[data-point="clan"]', matrix.clanPower);
  setText('[data-point="talent"]', matrix.talent);
  setText('[data-point="relation"]', matrix.relation);
  setText('[data-point="body"]', matrix.body);
  setText('[data-point="decade0"]', matrix.decade0);
  setText('[data-point="decade10"]', matrix.decade10);
  setText('[data-point="decade20"]', matrix.decade20);
  setText('[data-point="decade30"]', matrix.decade30);
  setText('[data-point="decade40"]', matrix.decade40);
  setText('[data-point="decade50"]', matrix.decade50);
  setText('[data-point="decade60"]', matrix.decade60);
  setText('[data-point="decade70"]', matrix.decade70);
  setText('[data-point="partner"]', matrix.partner);
  setText('[data-point="money"]', matrix.moneyCode);
  setText('[data-point="resource"]', matrix.resource);
  setText('[data-point="sky"]', matrix.sky);
  setText('[data-point="earth"]', matrix.earth);
  setText('[data-summary="age"]', getAge(date));
  setText('[data-summary="center"]', matrix.center);
  setText('[data-summary="inner"]', matrix.innerPower);
  setText('[data-summary="clan"]', matrix.clanPower);
  setText('[data-summary-text="center"]', meanings[matrix.center]);
  setText('[data-summary-text="inner"]', meanings[matrix.innerPower]);
  setText('[data-summary-text="clan"]', meanings[matrix.clanPower]);

  document.querySelectorAll('[data-age-point]').forEach((element, index) => {
    element.textContent = matrix.ageCycle[index] || '';
  });
}

function renderHealth(matrix) {
  healthBody.innerHTML = healthRows.map((row, index) => {
    const values = matrix.health[index];

    return `
      <tr>
        <td><strong>${row[0]}</strong><br><span>${row[1]}</span></td>
        <td>${values[0]}</td>
        <td>${values[1]}</td>
        <td>${values[2]}</td>
      </tr>
    `;
  }).join('');
}

function renderPrograms(matrix) {
  const items = [
    ['Пошук себе', matrix.search, meanings[matrix.search]],
    ['Соціалізація', matrix.social, meanings[matrix.social]],
    ['Стосунки', matrix.relation, meanings[matrix.relation]],
    ['Фінансовий потенціал', matrix.money, meanings[matrix.money]],
    ['Духовний вектор', matrix.spiritual, meanings[matrix.spiritual]],
    ['Планетарний вектор', matrix.planetary, meanings[matrix.planetary]],
  ];

  programs.innerHTML = items.map(([title, value, text]) => `
    <li class="program-item">
      <span>${title}: ${value}</span>
      ${text}
    </li>
  `).join('');
}

function showMatrix(shouldScroll = false) {
  const date = parseDate(dateInput.value);

  if (!date) {
    errorBox.textContent = dateInput.value.length === 10 ? 'Введіть коректну дату у форматі дд.мм.рррр.' : '';
    result.classList.add('matrix-empty');
    personName.textContent = 'Ваш персональний розрахунок';
    personDate.textContent = '';
    return;
  }

  const matrix = calculateMatrix(date);
  const name = nameInput.value.trim() || 'Ваш персональний розрахунок';

  personName.textContent = name;
  personDate.textContent = `${dateInput.value} - ${getAge(date)} років`;
  errorBox.textContent = '';

  renderMatrix(matrix, date);
  renderHealth(matrix);
  renderPrograms(matrix);

  result.classList.remove('calculator-hidden');
  result.classList.remove('matrix-empty');

  if (shouldScroll) {
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function formatInputDate(value) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);

  return parts.join('.');
}

dateInput.addEventListener('input', () => {
  dateInput.value = formatInputDate(dateInput.value);

  if (dateInput.value.length === 10) {
    showMatrix(true);
  } else {
    showMatrix(false);
  }
});

form.addEventListener('submit', event => {
  event.preventDefault();
  showMatrix(true);
});
