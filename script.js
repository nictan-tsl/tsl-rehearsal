const data = [
  ['7:30–7:40', 'Setup and briefing', ['Arrange chairs and stands', 'Tune instruments', 'Explain the rehearsal plan']],
  ['7:40–7:50', 'Miniature Overture', ['Play bars 1–16; stop at A', 'Check bars 1–8 and 9–16 if needed', 'Repeat bars 1–16 to verify']],
  ['7:50–8:05', 'The Blue Danube', ['Bars 23–30: waltz pulse and entries', 'Bars 40–48: rhythmic coordination', 'Bars 70–78: repeat and Coda navigation']],
  ['8:05–8:20', 'Enchanted Suite', ['Bars 65–72: 87 BPM and entries', 'Bars 73–82: rhythm and articulation', 'Bars 93–99: coordination']],
  ['8:20–8:45', 'Ensemble corrections', ['Choose the two biggest ensemble problems', 'Practise short passages slowly', 'Repeat to verify improvement']],
  ['8:45–8:55', 'Break', ['Identify sectional priorities']],
  ['8:55–9:25', 'Sectional practice', ['8:55–9:00: assign bars and objectives', '9:00–9:20: independent practice', '9:20–9:25: section leader debrief']],
  ['9:25–9:50', 'Reassemble and check', ['Test the main sectional correction', 'Miniature Overture bars 1–16, if needed', 'Blue Danube: test corrected passage', 'Enchanted Suite: test corrected passage']],
  ['9:50–10:00', 'Closing', ['Summarise improvements', 'Assign individual practice', 'Restore chairs and stands']]
];

const key = 'tsl-rehearsal-2026-11-07';
let state;

try {
  state = JSON.parse(localStorage.getItem(key)) || {};
} catch (e) {
  state = {};
}

function save() {
  localStorage.setItem(key, JSON.stringify(state));
  update();
}

function update() {
  const totalTasks = data.reduce((accumulator, block) => accumulator + block[2].length, 0);
  const completedTasks = Object.keys(state).filter((keyName) => keyName.startsWith('task-') && state[keyName]).length;

  document.getElementById('fill').style.width = `${(completedTasks / totalTasks) * 100}%`;
  document.getElementById('progressText').textContent = `${completedTasks} of ${totalTasks} tasks completed`;
}

function buildChecklist() {
  const root = document.getElementById('blocks');

  data.forEach((block, blockIndex) => {
    const article = document.createElement('article');
    const heading = document.createElement('h2');
    heading.textContent = `${block[0]}  |  ${block[1]}`;
    article.appendChild(heading);

    block[2].forEach((task, taskIndex) => {
      const taskKey = `task-${blockIndex}-${taskIndex}`;
      const label = document.createElement('label');
      label.className = 'task';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = !!state[taskKey];
      checkbox.addEventListener('change', () => {
        state[taskKey] = checkbox.checked;
        save();
      });

      const text = document.createElement('span');
      text.textContent = task;

      label.append(checkbox, text);
      article.appendChild(label);
    });

    root.appendChild(article);
  });
}

function buildNotes() {
  document.querySelectorAll('[data-note]').forEach((element) => {
    const noteKey = `note-${element.dataset.note}`;
    element.value = state[noteKey] || '';
    element.addEventListener('input', () => {
      state[noteKey] = element.value;
      save();
    });
  });
}

async function copyReport() {
  const report = 'TSL Rehearsal Report | 7 Nov 2026\n\n' +
    data.map((block, blockIndex) =>
      `${block[0]} ${block[1]}\n${block[2].map((task, taskIndex) => `${state[`task-${blockIndex}-${taskIndex}`] ? '[x] ' : '[ ] '}${task}`).join('\n')}`
    ).join('\n\n') +
    '\n\nNOTES\n' +
    [['Miniature Overture', 'mini'], ['The Blue Danube', 'blue'], ['Enchanted Suite', 'enchanted'], ['Sectional debrief', 'sectional']]
      .map(([label, keyName]) => `${label}: ${state[`note-${keyName}`] || 'None'}`)
      .join('\n');

  try {
    await navigator.clipboard.writeText(report);
    alert('Report copied!');
  } catch (error) {
    const textarea = document.createElement('textarea');
    textarea.value = report;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
    alert('Report copied.');
  }
}

function resetChecklist() {
  if (confirm('Clear all ticks and notes for this rehearsal?')) {
    localStorage.removeItem(key);
    location.reload();
  }
}

document.getElementById('export').addEventListener('click', copyReport);
document.getElementById('print').addEventListener('click', () => window.print());
document.getElementById('reset').addEventListener('click', resetChecklist);

buildChecklist();
buildNotes();
update();
