import React from 'react';

const topics = [
  { title: 'Variables & Types', learned: true },
  { title: 'Loops & Conditions', learned: true },
  { title: 'Functions', learned: false },
  { title: 'React Basics', learned: false },
];

const Roadmap = () => {
  return (
    <ul className="space-y-2">
      {topics.map((t, i) => (
        <li
          key={i}
          className={`p-2 rounded border ${
            t.learned ? 'bg-green-100 border-green-500' : 'bg-gray-100'
          }`}
        >
          {t.learned ? '✅' : '⬜'} {t.title}
        </li>
      ))}
    </ul>
  );
};

export default Roadmap;
