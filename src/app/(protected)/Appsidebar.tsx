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
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const Appsidebar = () => {
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
    {
      title: "Billing",
      url: "/billing",
      icon: CreditCard,
    },
  ];
  const project = [
    {
      name: "Project 1",
    },
    {
      name: "Project 1",
    },
    {
      name: "Project 1",
    },
  ];
  const { open } = useSidebar(); //will use for logo name
  const pathname = usePathname();
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>logo</SidebarHeader>
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
                        className={cn({
                          "!bg-primary !text-white": pathname === it.url,
                        })}
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
              {project.map((it, index) => {
                return (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton asChild>
                      <div>
                        <div
                          className={cn(
                            "text-primary flex size-6 items-center justify-center rounded-sm border bg-white text-sm",
                            {
                              "bg-primary text-white": true,
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
                    <Button variant="outline" className="w-fit">
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
