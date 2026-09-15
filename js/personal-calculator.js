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

function calculateAgeSegment(start, midpoint, end) {
  const before = reduce22(midpoint + start);
  const after = reduce22(midpoint + end);

  return [
    reduce22(before + start),
    before,
    reduce22(before + midpoint),
    midpoint,
    reduce22(after + midpoint),
    after,
    reduce22(after + end),
  ];
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
  const bottom = reduce22(day + month + year);
  const center = reduce22(day + month + year + bottom);
  const rightInner = reduce22(center + year);
  const bottomInner = reduce22(center + bottom);
  const relation = reduce22(rightInner + bottomInner);
  const partner = reduce22(relation + bottomInner);
  const money = reduce22(relation + rightInner);
  const bottomCore = reduce22(bottomInner + bottom);
  const topInner = reduce22(center + month);
  const topOuter = reduce22(topInner + month);
  const topResource = reduce22(topInner + center);
  const leftInner = reduce22(day + center);
  const leftOuter = reduce22(leftInner + day);
  const leftResource = reduce22(leftInner + center);
  const decade10 = reduce22(day + month);
  const decade30 = reduce22(year + month);
  const decade50 = reduce22(year + bottom);
  const decade70 = reduce22(day + bottom);
  const sky = reduce22(day + year);
  const earth = reduce22(month + bottom);
  const purpose = reduce22(sky + earth);
  const male = reduce22(decade10 + decade50);
  const female = reduce22(decade30 + decade70);
  const clanPower = reduce22(male + female);
  const topLeftInner = reduce22(decade10 + center);
  const topLeftOuter = reduce22(topLeftInner + decade10);
  const topRightInner = reduce22(center + decade30);
  const topRightOuter = reduce22(topRightInner + decade30);
  const bottomRightInner = reduce22(center + decade50);
  const bottomRightOuter = reduce22(bottomRightInner + decade50);
  const bottomLeftInner = reduce22(center + decade70);
  const bottomLeftOuter = reduce22(bottomLeftInner + decade70);
  const age5 = reduce22(decade10 + day);
  const age75 = reduce22(decade70 + day);
  const age65 = reduce22(decade70 + bottom);
  const age55 = reduce22(decade50 + bottom);
  const age45 = reduce22(decade50 + year);
  const age35 = reduce22(decade30 + year);
  const age25 = reduce22(decade30 + month);
  const age15 = reduce22(decade10 + month);
  const ageCycle = [
    ...calculateAgeSegment(day, age5, decade10),
    ...calculateAgeSegment(decade10, age15, month),
    ...calculateAgeSegment(month, age25, decade30),
    ...calculateAgeSegment(decade30, age35, year),
    ...calculateAgeSegment(year, age45, decade50),
    ...calculateAgeSegment(decade50, age55, bottom),
    ...calculateAgeSegment(bottom, age65, decade70),
    ...calculateAgeSegment(decade70, age75, day),
  ];

  const health = [
    [day, month, decade10],
    [leftOuter, topOuter, reduce22(leftOuter + topOuter)],
    [leftInner, topInner, reduce22(leftInner + topInner)],
    [leftResource, topResource, reduce22(leftResource + topResource)],
    [center, center, reduce22(center * 2)],
    [rightInner, bottomInner, relation],
    [year, bottom, leftOuter],
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
    bottom,
    center,
    rightInner,
    bottomInner,
    bottomCore,
    topInner,
    topOuter,
    topResource,
    leftInner,
    leftOuter,
    leftResource,
    clanPower,
    spiritual: reduce22(clanPower + purpose),
    planetary: reduce22(reduce22(clanPower + purpose) + purpose),
    money,
    relation,
    decade0: day,
    decade10,
    decade20: month,
    decade30,
    decade40: year,
    decade50,
    decade60: bottom,
    decade70,
    partner,
    sky,
    earth,
    purpose,
    male,
    female,
    innerPower: reduce22(center + clanPower),
    rightOuter: reduce22(year + rightInner),
    topLeftInner,
    topLeftOuter,
    topRightInner,
    topRightOuter,
    bottomRightInner,
    bottomRightOuter,
    bottomLeftInner,
    bottomLeftOuter,
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

function renderAgeRing(values = []) {
  const group = document.querySelector('[data-age-ring]');

  if (!group) {
    return;
  }

  const vertices = [
    [74, 379], [164, 162], [381, 74], [597, 162],
    [689, 379], [597, 596], [382, 684], [164, 596], [74, 379],
  ];
  const fractions = [0.21, 0.307, 0.404, 0.5, 0.596, 0.693, 0.79];
  const svgNamespace = 'http://www.w3.org/2000/svg';

  group.replaceChildren();

  for (let segment = 0; segment < 8; segment += 1) {
    const [startX, startY] = vertices[segment];
    const [endX, endY] = vertices[segment + 1];

    fractions.forEach((fraction, pointIndex) => {
      const index = segment * 7 + pointIndex;
      const x = startX + (endX - startX) * fraction;
      const y = startY + (endY - startY) * fraction;
      const distance = Math.hypot(x - 380, y - 380) || 1;
      const normalX = (x - 380) / distance;
      const normalY = (y - 380) / distance;
      const age = segment * 10 + (pointIndex < 3 ? pointIndex + 1 : pointIndex === 3 ? 5 : pointIndex + 2);
      const label = pointIndex === 3 ? `${age} років` : `${age}-${age + 1}`;
      const dot = document.createElementNS(svgNamespace, 'circle');
      const value = document.createElementNS(svgNamespace, 'text');
      const ageLabel = document.createElementNS(svgNamespace, 'text');

      dot.setAttribute('class', 'age-dot');
      dot.setAttribute('cx', x.toFixed(1));
      dot.setAttribute('cy', y.toFixed(1));
      dot.setAttribute('r', pointIndex === 3 ? '4' : '2.5');

      value.setAttribute('class', 'age-value');
      value.setAttribute('x', (x + normalX * 16).toFixed(1));
      value.setAttribute('y', (y + normalY * 16).toFixed(1));
      value.textContent = values[index] || '';

      ageLabel.setAttribute('class', 'age-label');
      ageLabel.setAttribute('x', (x - normalX * 14).toFixed(1));
      ageLabel.setAttribute('y', (y - normalY * 14).toFixed(1));
      ageLabel.textContent = label;

      group.append(dot, value, ageLabel);
    });
  }
}

function renderMatrix(matrix, date) {
  setText('[data-point="top"]', matrix.topInner);
  setText('[data-point="left"]', matrix.leftInner);
  setText('[data-point="right"]', matrix.rightInner);
  setText('[data-point="bottom"]', matrix.bottomCore);
  setText('[data-point="center"]', matrix.center);
  setText('[data-point="search"]', matrix.leftResource);
  setText('[data-point="social"]', matrix.clanPower);
  setText('[data-point="male"]', matrix.topLeftInner);
  setText('[data-point="female"]', matrix.topRightInner);
  setText('[data-point="inner"]', matrix.innerPower);
  setText('[data-point="clan"]', matrix.clanPower);
  setText('[data-point="talent"]', matrix.leftOuter);
  setText('[data-point="relation"]', matrix.relation);
  setText('[data-point="body"]', matrix.bottomRightInner);
  setText('[data-point="top-left-outer"]', matrix.topLeftOuter);
  setText('[data-point="top-right-outer"]', matrix.topRightOuter);
  setText('[data-point="bottom-left-inner"]', matrix.bottomLeftInner);
  setText('[data-point="bottom-left-outer"]', matrix.bottomLeftOuter);
  setText('[data-point="bottom-right-inner"]', matrix.bottomRightInner);
  setText('[data-point="bottom-right-outer"]', matrix.bottomRightOuter);
  setText('[data-point="right-outer"]', matrix.rightOuter);
  setText('[data-point="bottom-inner"]', matrix.bottomInner);
  setText('[data-point="partner"]', matrix.partner);
  setText('[data-point="money"]', matrix.money);
  setText('[data-point="channel-secondary"]', matrix.innerPower);
  setText('[data-point="decade0"]', matrix.decade0);
  setText('[data-point="decade10"]', matrix.decade10);
  setText('[data-point="decade20"]', matrix.decade20);
  setText('[data-point="decade30"]', matrix.decade30);
  setText('[data-point="decade40"]', matrix.decade40);
  setText('[data-point="decade50"]', matrix.decade50);
  setText('[data-point="decade60"]', matrix.decade60);
  setText('[data-point="decade70"]', matrix.decade70);
  setText('[data-point="resource"]', matrix.topResource);
  setText('[data-point="sky"]', matrix.topOuter);
  setText('[data-point="earth"]', matrix.bottomInner);
  setText('[data-summary="age"]', getAge(date));
  setText('[data-summary="center"]', matrix.center);
  setText('[data-summary="inner"]', matrix.innerPower);
  setText('[data-summary="clan"]', matrix.clanPower);
  setText('[data-summary-text="center"]', meanings[matrix.center]);
  setText('[data-summary-text="inner"]', meanings[matrix.innerPower]);
  setText('[data-summary-text="clan"]', meanings[matrix.clanPower]);

  renderAgeRing(matrix.ageCycle);
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
    ['Пошук себе', matrix.purpose, meanings[matrix.purpose]],
    ['Соціалізація', matrix.clanPower, meanings[matrix.clanPower]],
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
    renderAgeRing();
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

renderAgeRing();
