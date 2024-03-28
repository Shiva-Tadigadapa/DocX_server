import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyBzH7H-7EwRdK2ohKflYEvEDDhyS28DsnE";
const genAI = new GoogleGenerativeAI(API_KEY);

async function getCommitMessage(diffinput) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
  user input: ${diffinput}
    now the input is a dockerfile now you have to make that dockerfile more efficient
     and more optimized.
     Remember the dockerfile should be optimized and efficient.
     Remove all the unnecessary lines and make it more efficient.
     Remove redundant lines and make it more optimized.
     Remove any errors and make it more efficient.
     give him the final full dockerfile.
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text()
    return text;
}

export const getCommitMessage = async (req, res) => {
  const { diffinput } = req.body;
  const commitMessage = await getCommitMessage(diffinput);
  res.json(commitMessage);
};