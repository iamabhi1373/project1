function buildPersonalizedPrompt(userMemories, currentQuestion) {
    let weakSubjects = [];
    let preferredLanguage = "English";
  
    userMemories.forEach((memory) => {
      if (memory.quiz_score && memory.quiz_score < 50) {
        weakSubjects.push(memory.subject);
      }
  
      if (memory.language) {
        preferredLanguage = memory.language;
      }
    });
  
    weakSubjects = [...new Set(weakSubjects)];
  
    return `
  You are a helpful educational tutor.
  
  Student Preferred Language: ${preferredLanguage}
  Weak Subjects: ${weakSubjects.join(", ")}
  
  Current Student Question:
  ${currentQuestion}
  
  Explain in simple language.
  Give short examples.
  If the topic is weak for the student, explain more carefully.
  `;
  }
  
  module.exports = {
    buildPersonalizedPrompt,
  };