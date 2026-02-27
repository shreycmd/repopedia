"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import useProject from "@/hooks/use-Project";
import { api } from "@/trpc/react";
import React, { useState } from "react";
import AskQuestion from "../dashboard/AskQuestion";
import MDEditor from "@uiw/react-md-editor";
import CodeRefernces from "../dashboard/codeRefernces";

const QaPage = () => {
  const { projectId } = useProject();
  const [qIdx, setqIdx] = useState(0);

  const { data: questions } = api.project.getQuestions.useQuery({ projectId });
  const question = questions?.[qIdx];
  return (
    <Sheet>
      <AskQuestion />
      <div className="h-4"> </div>
      <h1 className="text-xl font-semibold">Saved Questions</h1>
      <div className="h-2"></div>
      <div className="flex flex-col gap-2">
        {questions?.map((ques, index) => {
          return (
            <React.Fragment key={ques.id}>
              <SheetTrigger onClick={() => setqIdx(index)}>
                <div className="shadow-border flex items-center gap-4 rounded-lg bg-white p-4">
                  <img
                    className="rounded-full"
                    height={30}
                    width={30}
                    src={question?.user.imageUrl ?? ""}
                  />
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-2">
                      <p className="line-clamp-1 text-lg font-medium text-gray-700">
                        {ques.question}
                      </p>
                      <span className="text-xs whitespace-nowrap text-gray-400">
                        {ques.createdAt.toLocaleString()}
                      </span>
                    </div>
                    <p className="line-clamp-1 text-sm text-gray-500">
                      {ques.answer}
                    </p>
                  </div>
                </div>
              </SheetTrigger>
            </React.Fragment>
          );
        })}
      </div>
      {question && (
        <SheetContent className="sm:max-w-[80vw]">
          <SheetHeader>
            <SheetTitle>{question.question}</SheetTitle>
            <MDEditor.Markdown source={question.answer} />
            {/* <CodeRefernces fileReferences={question.fileReferences ?? []} /> */}
          </SheetHeader>
        </SheetContent>
      )}
    </Sheet>
  );
};

export default QaPage;
