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

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
