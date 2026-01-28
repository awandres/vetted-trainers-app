"use client";

import Image from "next/image";
import { ArrowRight, CheckCircle, Users, Heart, TrendingUp, Award } from "lucide-react";
import { VTNavigation, VTFooter } from "../components";

const benefits = [
  {
    icon: Users,
    title: "Amazing Team",
    description: "Work alongside passionate, like-minded fitness professionals who support each other.",
  },
  {
    icon: Heart,
    title: "Make an Impact",
    description: "Help clients transform their lives and achieve goals they never thought possible.",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Skills",
    description: "Continuous learning opportunities and mentorship from industry veterans.",
  },
  {
    icon: Award,
    title: "Competitive Pay",
    description: "Earn what you deserve with competitive compensation and growth opportunities.",
  },
];

const requirements = [
  "Certified Personal Trainer (NASM, ACE, ACSM, or equivalent)",
  "Passion for helping others achieve their fitness goals",
  "Strong communication and interpersonal skills",
  "Reliable, punctual, and professional",
  "Experience preferred but not required for the right candidate",
  "Available to train clients in Frederick, MD area",
];

export default function VTJoinOurTeamPage() {
  return (
    <div className="min-h-screen bg-[#181818] font-sans antialiased">
      {/* Navigation */}
      <VTNavigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/vt/get-to-work.jpg')" }}
        />
        <div className="absolute inset-0 bg-[#181818]/85" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
              JOIN OUR <span className="text-[#50BFF4]">TEAM</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
              Are you a passionate fitness professional looking to make a real difference in people&apos;s lives? 
              We want to hear from you.
            </p>
            <a
              href="mailto:Tony@vettedtrainers.com?subject=Joining%20the%20Vetted%20Trainers%20Team"
              className="inline-flex items-center gap-2 bg-[#50BFF4] hover:bg-[#3DAEE3] text-black px-8 py-4 rounded-full font-bold text-lg transition-all hover:shadow-lg hover:shadow-[#50BFF4]/30 hover:scale-105"
            >
              Apply Now
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="py-20 bg-[#181818]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Why Join <span className="text-[#50BFF4]">Vetted Trainers</span>?
            </h2>
            <div className="w-24 h-1 bg-[#50BFF4] mx-auto" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="bg-[#252525] rounded-2xl p-6 hover:shadow-lg hover:shadow-[#50BFF4]/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="p-3 bg-[#50BFF4] rounded-xl w-fit mb-4">
                  <benefit.icon className="h-6 w-6 text-black" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We're Looking For */}
      <section className="py-20 bg-[#252525]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
                What We&apos;re <span className="text-[#50BFF4]">Looking For</span>
              </h2>
              <ul className="space-y-4">
                {requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="h-6 w-6 text-[#50BFF4] flex-shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <Image
                  src="/images/vt/joel_gym.jpg"
                  alt="Joel Arias training at Vetted Trainers"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#50BFF4] rounded-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Application CTA */}
      <section className="py-20 bg-[#181818]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
            Ready to Make a <span className="text-[#50BFF4]">Difference</span>?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Send us your resume and a brief introduction telling us why you&apos;d be a great fit for the Vetted Trainers team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:Tony@vettedtrainers.com?subject=Joining%20the%20Vetted%20Trainers%20Team"
              className="inline-flex items-center justify-center gap-2 bg-[#50BFF4] hover:bg-[#3DAEE3] text-black px-10 py-5 rounded-full font-bold text-lg transition-all hover:shadow-lg hover:shadow-[#50BFF4]/30 hover:scale-105"
            >
              Email Your Application
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
          <p className="text-gray-500 mt-6 text-sm">
            Email us at <a href="mailto:Tony@vettedtrainers.com" className="text-[#50BFF4] hover:underline">Tony@vettedtrainers.com</a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <VTFooter />
    </div>
  );
}
