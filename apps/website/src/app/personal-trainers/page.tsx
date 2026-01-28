import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { VTNavigation, VTFooter } from "../../components";

const CALENDLY_URL = "https://calendly.com/vetted-health/vetted-trainers-disco";

// Placeholder trainers - in production, these would come from the database
const trainers = [
  {
    name: "Tony Bianchini",
    title: "Founder & Head Trainer",
    bio: "With over 15 years of experience in personal training and movement optimization, Tony founded Vetted Trainers to bring elite-level coaching to Frederick.",
    image: "/images/trainer-1.jpg",
    specialties: ["Fascial Release", "Strength Training", "Movement Optimization"],
  },
  {
    name: "Joey Bomango",
    title: "Senior Trainer",
    bio: "Joey specializes in functional strength training and mobility work, helping clients move better and perform at their best.",
    image: "/images/trainer-2.jpg",
    specialties: ["Functional Training", "Mobility", "Sports Performance"],
  },
  {
    name: "Kade Arrington",
    title: "Trainer",
    bio: "Kade brings energy and expertise to every session, focusing on sustainable fitness habits and progressive overload.",
    image: "/images/trainer-3.jpg",
    specialties: ["Weight Training", "Body Composition", "Nutrition Coaching"],
  },
];

export default function PersonalTrainersPage() {
  return (
    <div className="min-h-screen bg-[#181818] font-sans antialiased">
      <VTNavigation />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-[#0f0f0f] to-[#181818]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
            Meet Our <span className="text-[#50BFF4]">Trainers</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Our team of certified professionals brings years of experience and a passion for helping you achieve your fitness goals.
          </p>
        </div>
      </section>

      {/* Trainers Grid */}
      <section className="py-20 bg-[#181818]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trainers.map((trainer, i) => (
              <div
                key={i}
                className="bg-[#252525] rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-[#50BFF4]/10 transition-all"
              >
                <div className="relative h-80">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#252525]" />
                  <Image
                    src={trainer.image}
                    alt={trainer.name}
                    fill
                    className="object-cover object-center"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-1">{trainer.name}</h3>
                  <p className="text-[#50BFF4] font-medium mb-4">{trainer.title}</p>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">{trainer.bio}</p>
                  <div className="flex flex-wrap gap-2">
                    {trainer.specialties.map((specialty, j) => (
                      <span
                        key={j}
                        className="px-3 py-1 bg-[#181818] text-gray-300 text-xs rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Our Team */}
      <section className="py-20 bg-[#252525]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
            Want to Join the Team?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            We&apos;re always looking for passionate trainers who share our commitment to excellence.
          </p>
          <a
            href="/join-our-team"
            className="inline-flex items-center gap-2 border-2 border-[#50BFF4] text-[#50BFF4] hover:bg-[#50BFF4] hover:text-black px-8 py-4 rounded-full font-bold transition-all"
          >
            Learn More
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#181818]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
            Ready to Train with Us?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Book your discovery call and meet your future trainer today.
          </p>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#50BFF4] hover:bg-[#3DAEE3] text-black px-10 py-5 rounded-full font-bold text-lg transition-all hover:shadow-lg"
          >
            Get Vetted!
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>

      <VTFooter />
    </div>
  );
}
