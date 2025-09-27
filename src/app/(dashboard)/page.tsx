import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import { createClient } from "@/utils/supabase/server";
import React from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import { redirect } from "next/navigation";
import OnboardingModal from "@/components/onboarding/OnboardingModal";

export const metadata: Metadata = {
  title: "MatchPal Portal - Medical School Mentorship Platform",
  description: "Connect medical students with experienced advisors, tutors, and mentors. Personalized guidance for medical school success and career development.",
  keywords: [
    "medical school tutoring",
    "medical student mentorship", 
    "med school advisors",
    "medical education",
    "USMLE tutoring",
    "medical school guidance",
    "healthcare mentors",
    "medical student support",
    "clinical mentorship",
    "medical career advice"
  ],
  authors: [{ name: "MatchPal" }],
  openGraph: {
    title: "MatchPal Portal - Medical School Mentorship Platform",
    description: "Connect medical students with experienced advisors, tutors, and mentors for personalized guidance.",
    type: "website",
    siteName: "MatchPal Portal",
  },
  twitter: {
    card: "summary_large_image",
    title: "MatchPal Portal - Medical School Mentorship Platform",
    description: "Connect medical students with experienced advisors, tutors, and mentors.",
  },
  robots: {
    index: true,
    follow: true,
  },
  category: "Education",
};

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*') // or specific fields you need
    .eq('id', user.id)
    .single()
    
  console.log(profile)
  if (profileError || !profile) {
    redirect('/error')
  }

  const { onboarding_completed } = profile;
  if (!onboarding_completed) {
    return (
      <OnboardingModal /> 
    )
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <EcommerceMetrics />

        <MonthlySalesChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <DemographicCard />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <RecentOrders />
      </div>
    </div>
  );
}
