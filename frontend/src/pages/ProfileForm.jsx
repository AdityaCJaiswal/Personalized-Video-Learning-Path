import { useState } from 'react';

const questions = [
  { q: "How do you prefer to learn?", options: ["video", "text", "audio"] },
  { q: "How do you revise best?", options: ["diagram", "quiz", "lecture"] },
  { q: "What helps you understand concepts?", options: ["video", "text", "audio"] },
  { q: "Which content do you enjoy more?", options: ["lecture", "quiz", "diagram"] },
];

export default function ProfileForm() {
  const [answers, setAnswers] = useState(Array(questions.length).fill(""));
  const [profile, setProfile] = useState("");

  const handleChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    const res = await fetch('http://localhost:5000/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers })
    });
    const data = await res.json();
    setProfile(data.profile);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Learning Style Questionnaire</h2>
      <div className="text-3xl font-bold text-green-600">Tailwind is working!</div>

      {questions.map((q, i) => (
        <div key={i} className="mb-4">
          <p className="font-medium">{q.q}</p>
          <div className="flex gap-4 mt-2">
            {q.options.map(opt => (
              <label key={opt} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`q${i}`}
                  value={opt}
                  onChange={() => handleChange(i, opt)}
                  checked={answers[i] === opt}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <button
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={handleSubmit}
      >
        Submit
      </button>

      {profile && (
        <div className="mt-6 p-4 border rounded bg-green-100 text-green-800">
          Your learning style is: <strong>{profile}</strong>
        </div>
      )}
    </div>
  );
}
