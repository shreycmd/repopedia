"use server";

import { streamText } from "ai";
import { createStreamableValue } from "@ai-sdk/rsc";
import { google } from "@ai-sdk/google";
import { GoogleGenAI } from "@google/genai";
import { getEmbeddings } from "@/lib/gemini";
import { db } from "@/server/db";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
export async function askAgent(question: string, projectId: string) {
  const { embedding: queryVector } = await getEmbeddings(question);

  if (!queryVector) {
    throw new Error("Failed to generate embeddings for the question");
  }

  const stream = createStreamableValue();
  const vectorQuery = `[${queryVector.join(",")}]`;

  const res = (await db.$queryRaw`
  SELECT
    "fileName",
    "sourceCode",
    "summary",
    1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
  FROM "SourceCodeEmbedding"
  WHERE
    "projectId" = ${projectId}
    AND 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.5
  ORDER BY similarity DESC
  LIMIT 10;
`) as { fileName: string; sourceCode: string; summary: string }[];
  let context = ``;
  for (const doc of res) {
    context += `source:${doc.fileName}\ncode content:${doc.sourceCode}\n summary of file:${doc.summary}`;
  }
  (async () => {
    const { textStream } = await streamText({
      model: google("gemini-2.5-flash-lite"),

      messages: [
        {
          role: "user",
          content: `You are an AI code assistant who answers questions about the codebase.

Your target audience is a technical intern who may not be fully familiar with the repository.

AI assistant is a brand new, powerful, human-like artificial intelligence.

The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
AI is a well-behaved and well-mannered individual.
AI is always friendly, kind, and inspiring, and is eager to provide vivid and thoughtful responses to the user.
AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic.

If the question is asking about code or a specific file, AI will provide a detailed answer, giving step-by-step instructions when necessary.

-------------------------
START CONTEXT BLOCK
${context}
END OF CONTEXT BLOCK
-------------------------

-------------------------
START QUESTION
${question}
END OF QUESTION
-------------------------

AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.

If the context does not provide the answer to the question, the AI assistant will say:
"I'm sorry, but I don't know the answer based on the provided context."

AI assistant will not apologize for previous responses, but instead will indicate new information was gained.

AI assistant will not invent anything that is not drawn directly from the context.

Answer in markdown syntax, with code snippets if needed.
Be as detailed as possible when answering.`,
        },
      ],
    });
    for await (const delta of textStream) {
      stream.update(delta);
    }
    stream.done();
  })();

  return { output: stream.value, fileReference: res };
}
