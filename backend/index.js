const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Mock logic: Generate learning profile from questionnaire
app.post('/api/profile', (req, res) => {
  const answers = req.body.answers;

  // Mock scoring logic
  let visual = 0, auditory = 0, logical = 0;

  answers.forEach(ans => {
    if (ans === 'video' || ans === 'diagram') visual++;
    else if (ans === 'audio' || ans === 'lecture') auditory++;
    else if (ans === 'text' || ans === 'quiz') logical++;
  });

  const max = Math.max(visual, auditory, logical);
  let profile = '';
  if (max === visual) profile = 'visual';
  else if (max === auditory) profile = 'auditory';
  else profile = 'logical';

  return res.json({ profile });
});

const mockVideos = [
  {
    id: 1,
    title: "Learn React Visually",
    url: "https://www.youtube.com/embed/Tn6-PIqc4UM",
    type: "visual",
  },
  {
    id: 2,
    title: "Logical Explanation of Algorithms",
    url: "https://www.youtube.com/embed/B31LgI4Y4DQ",
    type: "logical",
  },
  {
    id: 3,
    title: "Auditory Learning with Podcasts",
    url: "https://www.youtube.com/embed/--KhqFg9F3Q",
    type: "auditory",
  },
  {
    id: 4,
    title: "Animations to Understand JavaScript",
    url: "https://www.youtube.com/embed/o1IaduQICO0",
    type: "visual",
  },
];

app.get('/api/videos', (req, res) => {
  const profile = req.query.profile;
  const recommended = mockVideos.filter(video => video.type === profile);
  res.json(recommended);
});


app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
