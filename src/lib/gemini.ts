import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
import { Document } from "@langchain/core/documents";
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
import Groq from "groq-sdk";
const groq = new Groq();
async function main() {
  const completion = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      {
        role: "user",
        content: "Explain why fast inference is critical for reasoning models",
      },
    ],
  });
  console.log(completion.choices[0]?.message?.content);
}

export async function aisummarizeCommits(diff: string) {
  //   const completion = await groq.chat.completions.create({
  //     model: "meta-llama/llama-4-scout-17b-16e-instruct",
  //     messages: [
  //       {
  //         role: "user",
  //         content: `You are an AI assistant that writes concise Git commit summaries.

  // Below is a git diff showing code changes.

  // Rules:
  // - A line starting with '+' means the line was added.
  // - A line starting with '-' means the line was deleted.
  // - Lines without '+' or '-' are context only.
  // - Ignore file metadata lines.
  // - Focus only on meaningful code changes.

  // Write a short bullet-point summary describing what changed.

  // EXAMPLE SUMMARY COMMENTS:

  // - Raised the amount of returned recordings from 10 → 100
  // - Fixed typo in github action name
  // - Moved Octokit initialization to separate file
  // - Added OpenAI API for completions
  // - Lowered numeric tolerance for test files

  // Most commits will have fewer comments than this example.
  // Do NOT include filenames unless necessary.

  // Please summarize the following diff:
  // ${diff}
  // `,
  //       },
  //     ],
  //   });
  //   const text = completion.choices[0]?.message?.content;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `
  You are an AI assistant that writes concise Git commit summaries.

  Below is a git diff showing code changes.

  Rules:
  - A line starting with '+' means the line was added.
  - A line starting with '-' means the line was deleted.
  - Lines without '+' or '-' are context only.
  - Ignore file metadata lines.
  - Focus only on meaningful code changes.

  Write a short bullet-point summary describing what changed.

  EXAMPLE SUMMARY COMMENTS:

  - Raised the amount of returned recordings from 10 → 100
  - Fixed typo in github action name
  - Moved Octokit initialization to separate file
  - Added OpenAI API for completions
  - Lowered numeric tolerance for test files

  Most commits will have fewer comments than this example.
  Do NOT include filenames unless necessary.

  Please summarize the following diff in note more then 100 words:
  ${diff}
  `,
          },
        ],
      },
    ],
  });

  return response?.text ?? "";
}

export async function summarizeCode(doc: Document): Promise<string> {
  const code = doc.pageContent.slice(0, 10000);
  const completion = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      {
        role: "user",
        content: `You are an AI assistant that writes concise summaries of code files.


Below is the content of a code file:

${code}

Please summarize the purpose and functionality of this code in not more then 100 words.`,
      },
    ],
  });
  const text = completion.choices[0]?.message?.content;
  //   const response = await ai.models.generateContent({
  //     model: "gemini-2.5-flash-lite",
  //     contents: [
  //       {
  //         role: "user",
  //         parts: [
  //           {
  //             text: `
  // You are an AI assistant that writes concise summaries of code files.

  // Below is the content of a code file:

  // ${code}

  // Please summarize the purpose and functionality of this code in not more then 100 words.
  // `,
  //           },
  //         ],
  //       },
  //     ],
  //   });
  return text ?? "";
}

export async function getEmbeddings(summary: string) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: summary,
    config: { outputDimensionality: 768 },
  });

  return {
    embedding: response.embeddings?.[0]?.values,
  };
}
//console.log(await getEmbeddings("hello world"));
// console.log(await generateEmbeddings("hello world"));
