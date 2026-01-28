"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTPGroup } from "@/components/ui/input-otp";
import useRefetch from "@/hooks/use-Refetch";
import { api } from "@/trpc/react";
import Image from "next/image";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
type FormInput = {
  repoURL: string;
  ProjectName: string;
};
const CreateProject = () => {
  const refetch = useRefetch();
  const createproject = api.project.createProject.useMutation();
  const { register, handleSubmit, reset } = useForm<FormInput>();
  function onSubmit(data: FormInput) {
    createproject.mutate(
      {
        githubUrl: data.repoURL,
        name: data.ProjectName,
      },
      {
        onSuccess: () => {
          toast.success("Project Created Successfully");
          refetch();
          reset();
        },
        onError: () => {
          toast.error("Failed to create project");
        },
      },
    );
    //window.alert(JSON.stringify(data, null, 0));
    return true;
  }
  return (
    <div className="flex h-full items-center justify-center gap-12">
      {/* <Image alt="" src="" className="h-56 w-auto" /> */}
      <div>
        <div>
          <h1 className="text-2xl font-semibold"> Link Your Repository</h1>
          <p className="text-muted-foreground text-sm">
            Enter the URL of Your Repository to link it to RepoPedia
          </p>
        </div>
        <div className="h-4"></div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register("ProjectName", { required: true })}
              placeholder="Project Name"
              required
            />
            <Input
              {...register("repoURL", { required: true })}
              placeholder="GitHub Url"
              type="url"
              required
            />
            <div className="h-4"></div>
            <Button type="submit" disabled={createproject.isPending}>
              Create Project
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
