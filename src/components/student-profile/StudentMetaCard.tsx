"use client";
import React from "react";
import Image from "next/image";
import { useProfile } from "@/context/ProfileContext";

// Helper function to generate avatar URL
function getAvatarUrl(firstName: string, lastName: string, email?: string) {
  const name = `${firstName} ${lastName}`.trim();
  const seed = email || name;
  // Using DiceBear's initials style with a consistent color scheme
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=3b82f6`;
}

export default function StudentMetaCard() {
  const { profile, email } = useProfile();
  const { role, first_name, last_name, phone } = profile;

  const avatarUrl = getAvatarUrl(first_name || "", last_name || "", email);

  return (
    <>
      <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex w-full flex-col items-center gap-6 xl:flex-row">
            <div className="h-20 w-20 overflow-hidden rounded-full border border-gray-200 dark:border-gray-800">
              <Image
                width={80}
                height={80}
                src={avatarUrl}
                alt={`${first_name} ${last_name}`}
                unoptimized // Required for external SVG URLs
              />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-center text-lg font-semibold text-gray-800 xl:text-left dark:text-white/90">
                {first_name} {last_name}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {role}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 xl:block dark:bg-gray-700"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {phone}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}