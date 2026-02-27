import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { getEmbeddings, summarizeCode } from "./gemini";
import { db } from "@/server/db";

export const loadGithubRepo = async (
  githubUrl: string,
  githubToken?: string,
) => {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || "",
    branch: "main",
    ignoreFiles: [
      "package-lock.json",
      "package.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "bun.lockb",
    ],
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5,
  });
  const docs = await loader.load();
  return docs;
};
export const indexGithubRepo = async (
  githubUrl: string,
  githubToken: string | undefined,
  projectId: string,
) => {
  const docs = await loadGithubRepo(githubUrl, githubToken);
  const allembeddings = await generateEmbedings(docs);
  await Promise.all(
    allembeddings.map(async (embedding, index) => {
      if (!embedding) return;
      const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
        data: {
          sourceCode: embedding.sourceCode,
          fileName: embedding.fileName,
          summary: embedding.summary,
          projectId,
        },
      });
      await db.$executeRaw`
        UPDATE "SourceCodeEmbedding"
        SET "summaryEmbedding" = ${embedding.embedding}::vector
        WHERE "id" = ${sourceCodeEmbedding.id}`;
    }),
  );
};

const generateEmbedings = async (docs: Document[]) => {
  return await Promise.all(
    docs.map(async (doc) => {
      const summary = await summarizeCode(doc);
      const embedding = await getEmbeddings(summary);
      return {
        embedding: embedding.embedding,
        summary,
        sourceCode: JSON.stringify(doc.pageContent),
        fileName: doc.metadata.source,
      };
    }),
  );
};
// console.log(await loadGithubRepo("https://github.com/shreycmd/ytchat"));
