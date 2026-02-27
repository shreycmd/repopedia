"use client";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/hooks/use-Project";
import React, { useState } from "react";
import { askAgent } from "./action";
import { readStreamableValue } from "@ai-sdk/rsc";
import CodeRefernces from "./codeRefernces";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-Refetch";

const AskQuestion = () => {
  const saveAnswer = api.project.saveAnswer.useMutation();
  const { project } = useProject();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [Loading, setLoading] = useState(false);
  const [fileReference, setFilereference] = useState<
    { fileName: string; sourceCode: string; summary: string }[]
  >([]);
  const onsubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setAnswer("");
    setFilereference([]);
    e.preventDefault();

    if (!project?.id) {
      toast.error("Project ID is not available");
      return;
    }

    setLoading(true);

    const { output, fileReference } = await askAgent(question, project.id);
    setOpen(true);
    setFilereference(fileReference);
    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        setAnswer((ans) => ans + delta);
      }
    }
    setLoading(false);
    // if (!res.body) {
    //   setLoading(false);
    //   throw new Error("No response body (stream) returned.");
    // }

    // const reader = res.body.getReader();
    // const decoder = new TextDecoder();

    // try {
    //   while (true) {
    //     const { done, value } = await reader.read();
    //     if (done) break;

    //     // NOTE: { stream: true } avoids breaking multi-byte chars
    //     setOut((prev) => prev + decoder.decode(value, { stream: true }));
    //   }
    // } finally {
    //   setLoading(false);
    //   reader.releaseLock();
    // }
  };
  const refetch = useRefetch();

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[80vw]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>Logo</DialogTitle>
              <Button
                disabled={saveAnswer.isPending}
                variant={"outline"}
                onClick={() =>
                  saveAnswer.mutate(
                    {
                      projectId: project!.id,
                      question,
                      answer,
                      fileReferences: fileReference,
                    },
                    {
                      onSuccess: () => {
                        toast.success("Answer Saved!");
                        refetch();
                      },
                      onError: () => {
                        toast.error("Failed to save Answer");
                      },
                    },
                  )
                }
              >
                Save Answer
              </Button>
            </div>
          </DialogHeader>

          <MDEditor.Markdown
            source={answer}
            className="!h-full max-h-[40vh] max-w-[70vw] overflow-y-scroll"
          />

          <div className="h-4"></div>
          {/* <CodeRefernces fileReferences={fileReference } /> */}

          <Button type="button" onClick={() => setOpen(false)}>
            {" "}
            Close{" "}
          </Button>
        </DialogContent>
      </Dialog>
      <Card className="relative">
        <CardHeader>
          <CardTitle>Ask a Question?</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onsubmit}>
            <Textarea
              placeholder="WHich file should i edit to change homepage?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="h-4"></div>
            <Button type="submit" disabled={Loading}>
              Ask Agent
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestion;
