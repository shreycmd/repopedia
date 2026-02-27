"use client";
import useProject from "@/hooks/use-Project";
import { useUser } from "@clerk/nextjs";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import React from "react";
import CommitLog from "./commit-log";
import AskQuestion from "./AskQuestion";

const Dashboard = () => {
  const { user } = useUser();
  const { project } = useProject();
  return (
    <div>
      <div className="flex-wap flex items-center justify-between gap-y-4">
        {/* githublink */}
        <div className="bg-primary flex w-fit rounded-md px-4 py-3">
          <Github className="size-5 text-white" />
          <div className="ml-2">
            <p className="text-sm font-medium text-white">
              This project is linked to{" "}
              <Link
                href={project?.githubUrl ?? ""}
                className="inline-flex items-center text-white/80 hover:underline"
              >
                {project?.githubUrl}
                <ExternalLink className="ml-1 size-4" />
              </Link>
            </p>
          </div>
        </div>
        <div className="h-4"></div>
        <div className="flex items-center gap-4">
          team member invite button archive button
        </div>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AskQuestion />
        </div>
      </div>
      <div className="mt-8">
        <CommitLog />
      </div>
    </div>
  );
};

export default Dashboard;
