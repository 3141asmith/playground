/* Additional reading surrounds the existing labs without rebuilding their DOM. */
(() => {
  'use strict';
  const make = (tag, text, cls) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (cls) node.className = cls;
    return node;
  };
  const paragraphs = (parent, copy) => copy.forEach(text => parent.append(make('p', text)));
  for (const [id, guide] of Object.entries(window.CSStudyGuides || {})) {
    const panel = document.getElementById(id);
    if (!panel || panel.querySelector('.study-reading')) continue;
    const reading = make('section', undefined, 'study-reading');
    reading.setAttribute('aria-label', 'Study guide');
    reading.append(make('p', 'UNDERSTAND / CONNECT / EXPLAIN', 'eyebrow'));
    const intro = make('div', undefined, 'study-overview');
    intro.append(make('h3', 'Build your understanding.'), make('p', guide.goal));
    const jumps = make('div', undefined, 'study-jumps');
    intro.append(jumps);
    reading.append(intro);
    const terms = make('dl', undefined, 'study-terms');
    for (const [term, definition] of guide.terms) {
      const pair = make('div');
      pair.append(make('dt', term), make('dd', definition));
      terms.append(pair);
    }
    reading.append(terms);
    guide.sections.forEach(([heading, ...copy]) => {
      const section = make('section', undefined, 'study-section');
      section.append(make('h3', heading));
      paragraphs(section, copy);
      reading.append(section);
    });
    const examples = make('section', undefined, 'study-examples');
    examples.setAttribute('aria-label', 'Worked examples');
    examples.append(make('p', 'FOLLOW THE REASONING', 'eyebrow'), make('h3', 'Worked examples.'));
    guide.examples.forEach((example, i) => {
      const article = make('article', undefined, 'study-example');
      article.append(make('h4', `${i + 1}. ${example.title}`), make('p', example.given));
      const steps = make('ol');
      example.steps.forEach(step => steps.append(make('li', step)));
      article.append(steps);
      if (example.table) {
        const wrap = make('div', undefined, 'study-table');
        wrap.tabIndex = 0;
        wrap.setAttribute('role', 'region');
        wrap.setAttribute('aria-label', example.title + ' table');
        const table = make('table'), caption = make('caption', example.table.caption);
        table.append(caption);
        const head = make('thead'), tr = make('tr');
        example.table.head.forEach(text => { const th = make('th', text); th.scope = 'col'; tr.append(th); });
        head.append(tr);
        const body = make('tbody');
        example.table.rows.forEach(row => { const tr = make('tr'); row.forEach(text => tr.append(make('td', String(text)))); body.append(tr); });
        table.append(head, body); wrap.append(table); article.append(wrap);
      }
      article.append(make('p', example.answer, 'study-conclusion'));
      examples.append(article);
    });
    reading.append(examples);
    const firstLab = panel.querySelector(':scope > .lab');
    panel.insertBefore(reading, firstLab || panel.querySelector('.reviewed'));
    const prediction = make('aside', undefined, 'study-prediction');
    prediction.append(make('h4', 'Predict, then use the interactive.'), make('p', guide.lab));
    if (firstLab) firstLab.before(prediction);
    const apply = make('section', undefined, 'study-apply');
    apply.setAttribute('aria-label', 'Apply and check understanding');
    apply.append(make('p', 'EXPLAIN IT FOR YOURSELF', 'eyebrow'), make('h3', 'Check your understanding.'));
    apply.append(make('p', 'Try each question before opening the explanation. These are original practice questions; the answers show reasoning rather than an official mark scheme.'));
    guide.checks.forEach(([question, answer]) => {
      const details = make('details', undefined, 'study-check');
      details.append(make('summary', question), make('p', answer));
      apply.append(details);
    });
    const mistakes = make('aside', undefined, 'study-misconceptions');
    mistakes.append(make('h4', 'Common traps'));
    const list = make('ul');
    guide.traps.forEach(text => list.append(make('li', text)));
    mistakes.append(list); apply.append(mistakes);
    const exam = make('div', undefined, 'study-exam');
    exam.append(make('h4', 'Build a strong explanation'), make('p', guide.exam));
    apply.append(exam);
    panel.insertBefore(apply, panel.querySelector(':scope > .reviewed'));
    for (const [label, target] of [['Worked examples', examples], ['Interactive lab', firstLab], ['Practice & answers', apply]]) {
      if (!target) continue;
      const button = make('button', label);
      button.type = 'button';
      button.addEventListener('click', () => {
        target.scrollIntoView({block: 'start', behavior: 'auto'});
        target.tabIndex = -1;
        target.focus({preventScroll: true});
      });
      jumps.append(button);
    }
    panel.dataset.studyReady = 'true';
  }
  document.body.dataset.studyReady = 'true';
})();
