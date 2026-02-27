import "dotenv/config";
import { db } from "@/server/db";
import { Octokit } from "octokit";
import axios from "axios";
import { aisummarizeCommits } from "./gemini";
export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const url = "https://github.com/shreycmd/ytchat";
type responses = {
  commitHash: string;
  commitMessage: string;
  commitAuthor: string;
  commitAuthorAvatarUrl?: string;
  commitDate: string;
};

export const pollCommits = async (projectId: string) => {
  const { project, githubUrl } = await FetchProjectGithubUrl(projectId);
  const commithashes = await getCommitHashes(githubUrl);
  const unprocessedCommits = await filterUnprocessedCommits(
    projectId,
    commithashes,
  );

  const summaryresponse = await Promise.allSettled(
    unprocessedCommits.map((commit) => {
      return SummarizeCommits(githubUrl, commit.commitHash);
    }),
  );
  const summaries = summaryresponse.map((res) => {
    if (res.status === "fulfilled") {
      return res.value;
    } else {
      console.error("Error summarizing commit:", res.reason);
      return "";
    }
  });
  const commits = await db.commit.createMany({
    data: summaries.map((summary, index) => {
      console.log(`processing commit ${index}`);
      return {
        commitHash: unprocessedCommits[index]!.commitHash,
        commitMessage: unprocessedCommits[index]!.commitMessage,
        commitAuthor: unprocessedCommits[index]!.commitAuthor,
        commitAuthorAvatarUrl:
          unprocessedCommits[index]!.commitAuthorAvatarUrl ?? "",
        commitDate: unprocessedCommits[index]!.commitDate,
        summary: summary,
        projectId,
      };
    }),
  });
  return commits;
};
export const getCommitHashes = async (url: string): Promise<responses[]> => {
  const [owner, repo] = url.split("/").slice(-2);
  if (!owner || !repo) {
    throw new Error("Invalid github url");
  }
  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
  });
  const sortedCommits = data.sort((a: any, b: any) => {
    return (
      new Date(b.commit.author.date).getTime() -
      new Date(a.commit.author.date).getTime()
    );
  });
  const commitHashes = sortedCommits.map((commit: any) => {
    return {
      commitHash: commit.sha,
      commitMessage: commit.commit.message,
      commitAuthor: commit.commit.author.name,
      commitAuthorAvatarUrl: commit.author?.avatar_url || null,
      commitDate: commit.commit.author.date,
    };
  });
  return commitHashes;
};
async function SummarizeCommits(gitHubUrl: string, commitHash: string) {
  const { data } = await axios.get(`${gitHubUrl}/commits/${commitHash}.diff`, {
    headers: {
      Accept: "application/vnd.github.v3.diff",
    },
  });
  console.log(`summarizing commit ${commitHash}`);
  return (await aisummarizeCommits(data)) || "";
}
async function filterUnprocessedCommits(
  projectId: string,
  commitHashes: responses[],
) {
  const processedCommits = await db.commit.findMany({
    where: { projectId },
  });
  const unprocessedCommits = commitHashes.filter((commit) => {
    return !processedCommits.some(
      (processedCommit) => processedCommit.commitHash === commit.commitHash,
    );
  });
  return unprocessedCommits;
}

async function FetchProjectGithubUrl(projectId: string) {
  //fetch project from db using projectId and return the github url
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: {
      githubUrl: true,
    },
  });

  if (!project?.githubUrl) {
    throw new Error("Github url not found for project");
  }
  return { project, githubUrl: project?.githubUrl };
}
