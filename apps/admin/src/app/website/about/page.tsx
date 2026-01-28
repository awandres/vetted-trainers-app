"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { VTNavigation, VTFooter } from "../components";

const CALENDLY_URL = "https://calendly.com/vetted-health/vetted-trainers-disco";

// Leadership team with detailed bios
const leadership = [
  {
    name: "Joel Arias",
    title: "Founder of Vetted Trainers",
    image: "/images/vt/Trainer Headshots/joel-headshot.webp",
    bio: "Meet Joel Arias! Joel is at the helm as the fearless leader of Vetted Trainers, has designed all of the movement programs, and developed the movement ideology behind Vetted Trainers. Joel has always had a perspicacity into human movement, but a serious knee injury took him on a journey that led him to create a system to give people hope again. He was told that he would never have speed or power in his leg again and he would not accept this. He created a system to heal his knee and now he and his team go after any movement issues that keep you from pursuing your best life!",
  },
  {
    name: "Tony Bianchini",
    title: "Director of Member Journeys",
    image: "/images/vt/Trainer Headshots/Tony Bianchini(2).png",
    bio: "Tony's role is completely unique and born from the idea that our Members come first. He makes sure that you are placed with the Personal Trainer that suits your needs best and will also be following up with you to make sure that your health needs are being met in a stellar fashion! If you would like to be a Vetted Member, speaking with Tony is the first step.",
    scheduleUrl: "https://calendly.com/vetted-health/vetted-health-disco",
  },
  {
    name: "Joey Bomango",
    title: "Director of Training",
    image: "/images/vt/Trainer Headshots/Joey Bomango.png",
    bio: "Joey has been working by Joel's side from the beginning and has the greatest depth of knowledge of biomechanics on the team. Joey will evaluate your musculoskeletal system in your first session so that you understand the root of your pain. He will then design a movement program for you that will lead to physical victory with the most rapidity. Tony then takes this information and finds the perfect Personal Trainer to guide you through your journey!",
  },
];

// Team members (Personal Trainers)
const teamMembers = [
  { name: "Jose", fullName: "Jose Recio", image: "/images/vt/Trainer Headshots/Jose Recio Headshot.png" },
  { name: "Kade", fullName: "Kade Arrington", image: "/images/vt/Trainer Headshots/Kade Arrington(1).png" },
  { name: "Michael", fullName: "Michael Coleman", image: "/images/vt/Trainer Headshots/Michael Coleman Head Shot.png" },
  { name: "Youssef", fullName: "Youssef Salem", image: "/images/vt/Trainer Headshots/Youssef Salem Headshot.png" },
  { name: "Lex", fullName: "Lex Titus", image: "/images/vt/Trainer Headshots/Lex Titus headshot.png" },
  { name: "Shane", fullName: "Shane Mullen", image: "/images/vt/Trainer Headshots/Shane Mullen Headshot.png" },
  { name: "Ben", fullName: "Ben Sicat", image: "/images/vt/Trainer Headshots/Ben Sicat headshot.png" },
  { name: "Nick", fullName: "Nick Rispoli", image: "/images/vt/Trainer Headshots/Nick Rispoli Headshot.png" },
  { name: "Jae", fullName: "Jaelyn Blanc", image: "/images/vt/Trainer Headshots/Jaelyn Blanc headshot.png" },
  { name: "Matthew", fullName: "Matthew Albano", image: "/images/vt/Trainer Headshots/Matt-Albano.webp" },
  { name: "Luke", fullName: "Luke Boyds", image: "/images/vt/Trainer Headshots/Luke Boyds headshot.png" },
  { name: "Will", fullName: "Will Albritton", image: "/images/vt/Trainer Headshots/Will Albritton .png" },
];

export default function VTAboutPage() {
  return (
    <div className="min-h-screen bg-[#181818] font-sans antialiased">
      {/* Navigation */}
      <VTNavigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-[#181818]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
              About <span className="text-[#50BFF4]">Vetted Trainers</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Meet the team dedicated to helping you become stronger, healthier, and more confident.
            </p>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-20 bg-[#252525]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {leadership.map((leader, index) => (
            <div
              key={leader.name}
              className={`grid md:grid-cols-2 gap-12 items-center ${
                index !== leadership.length - 1 ? "mb-20 pb-20 border-b border-white/10" : ""
              }`}
            >
              {/* Image - always on left */}
              <div className="relative">
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl max-w-md mx-auto">
                  <Image
                    src={leader.image}
                    alt={`${leader.name} - ${leader.title}`}
                    fill
                    className="object-cover object-top"
                  />
                </div>
                <div className="absolute w-32 h-32 bg-[#50BFF4] rounded-2xl -z-10 -bottom-4 -right-4" />
              </div>

              {/* Content - always on right */}
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
                  {leader.name}
                </h2>
                <p className="text-[#50BFF4] font-medium text-lg mb-6">{leader.title}</p>
                <p className="text-gray-300 leading-relaxed text-lg mb-6">
                  {leader.bio}
                </p>
                {leader.scheduleUrl && (
                  <a
                    href={leader.scheduleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#50BFF4] hover:bg-[#3DAEE3] text-black px-6 py-3 rounded-full font-bold transition-all hover:shadow-lg"
                  >
                    <Calendar className="h-5 w-5" />
                    Talk to {leader.name.split(" ")[0]}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-[#181818]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Meet Our <span className="text-[#50BFF4]">Team</span>
            </h2>
            <div className="w-24 h-1 bg-[#50BFF4] mx-auto mb-6" />
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Our Personal Trainers are ready to guide you on your fitness journey.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="relative aspect-square rounded-2xl overflow-hidden bg-[#252525]"
              >
                <Image
                  src={member.image}
                  alt={`${member.fullName} - Vetted Trainer`}
                  fill
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-xl font-bold text-white">{member.name}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* View All Personal Trainers Link */}
          <div className="text-center mt-12">
            <Link
              href="/website/personal-trainers"
              className="inline-flex items-center gap-2 text-[#50BFF4] hover:text-white font-bold text-lg transition-colors group"
            >
              View All Trainers & Schedule
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 bg-[#252525]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-8">
            Our <span className="text-[#50BFF4]">Philosophy</span>
          </h2>
          <blockquote className="text-xl md:text-2xl text-gray-300 italic leading-relaxed mb-8">
            &ldquo;We believe that everyone deserves to move pain-free and feel confident in their body. 
            Our unique approach combines strength training, mobility work, and fascial release to address 
            the root causes of movement dysfunction and help you achieve lasting results.&rdquo;
          </blockquote>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-6 py-3 bg-[#181818] rounded-full text-[#50BFF4] font-medium">
              Strength Training
            </div>
            <div className="px-6 py-3 bg-[#181818] rounded-full text-[#50BFF4] font-medium">
              Mobility Work
            </div>
            <div className="px-6 py-3 bg-[#181818] rounded-full text-[#50BFF4] font-medium">
              Fascial Release
            </div>
            <div className="px-6 py-3 bg-[#181818] rounded-full text-[#50BFF4] font-medium">
              Personalized Programs
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#181818]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
            Ready to Join the <span className="text-[#50BFF4]">Vetted</span> Family?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Take the first step towards a stronger, healthier you. We can&apos;t wait to meet you.
          </p>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#50BFF4] hover:bg-[#3DAEE3] text-black px-10 py-5 rounded-full font-bold text-lg transition-all hover:shadow-lg hover:shadow-[#50BFF4]/30 hover:scale-105"
          >
            Get Vetted!
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <VTFooter />
    </div>
  );
}
