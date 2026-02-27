"use client";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import useProject from "@/hooks/use-Project";
import { cn } from "@/lib/utils";
import { url } from "inspector";
import {
  Bot,
  Briefcase,
  CreditCard,
  LayoutDashboard,
  Plus,
  Presentation,
} from "lucide-react";
import logo from "public/tex.png";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
const item = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },

  {
    title: "Q&A",
    url: "/qa",
    icon: Bot,
  },
];
const Appsidebar = () => {
  const { projects, projectId, setProjectId } = useProject();

  const { open } = useSidebar(); //will use for logo name
  const pathname = usePathname();
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Image src={logo} alt="logo" width={150} height={150} />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {item.map((it) => {
                return (
                  <SidebarMenuItem key={it.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={it.url}
                        className={cn(
                          {
                            "!bg-primary !text-white": pathname === it.url,
                          },
                          "list-none",
                        )}
                      >
                        <it.icon />
                        <span> {it.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Your Project</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects?.map((it, index) => {
                return (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton asChild>
                      <div
                        onClick={() => {
                          setProjectId(it.id);
                        }}
                      >
                        <div
                          className={cn(
                            "text-primary flex size-6 items-center justify-center rounded-sm border bg-white text-sm",
                            {
                              "bg-primary text-white": it.id === projectId,
                            },
                          )}
                        >
                          {it.name[0]}
                        </div>
                        {it.name}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              <div className="h-2"> </div>
              {open && (
                <SidebarMenuItem>
                  <Link href="/create">
                    <Button variant="outline" size="sm" className="w-fit">
                      <Plus></Plus> Create Project
                    </Button>
                  </Link>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default Appsidebar;
