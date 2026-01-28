import Image from "next/image";
import { ArrowRight, Target, Heart, Zap } from "lucide-react";
import { VTNavigation, VTFooter } from "../../components";

const CALENDLY_URL = "https://calendly.com/vetted-health/vetted-trainers-disco";

const values = [
  {
    icon: Target,
    title: "Results-Driven",
    description: "Every program is designed with clear goals and measurable outcomes. We don't just train you—we transform you.",
  },
  {
    icon: Heart,
    title: "Member-Focused",
    description: "You're not just a client—you're family. We invest in your success because your victories are our victories.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "We continuously evolve our methods, combining proven techniques with cutting-edge science to deliver optimal results.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#181818] font-sans antialiased">
      <VTNavigation />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-[#0f0f0f] to-[#181818]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
            About <span className="text-[#50BFF4]">Vetted Trainers</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Frederick, Maryland&apos;s premier personal training destination. We&apos;re not just trainers—we&apos;re movement specialists dedicated to optimizing how you feel and perform.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-[#181818]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  Vetted Trainers was founded with a simple but powerful mission: to provide the highest quality personal training experience in Frederick, Maryland.
                </p>
                <p>
                  What sets us apart is our unique approach. We don&apos;t just focus on traditional strength training—we integrate fascial techniques, mobility work, and tissue manipulation to create a comprehensive system that optimizes your entire body.
                </p>
                <p>
                  Our private, members-only facility provides an exclusive environment where you can focus entirely on your training without distractions. Every session is one-on-one, ensuring you get the personalized attention you deserve.
                </p>
              </div>
            </div>
            <div className="relative aspect-square rounded-2xl overflow-hidden">
              <Image
                src="/images/gym-room.jpg"
                alt="Vetted Trainers Gym"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-[#252525]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Our Mission</h2>
          <div className="w-24 h-1 bg-[#50BFF4] mx-auto mb-8" />
          <p className="text-xl text-gray-300 italic leading-relaxed">
            &quot;At Vetted Trainers, our mission is to deliver unparalleled personal training, providing our elite members with a bespoke, top-tier fitness experience that transforms how they move, feel, and live.&quot;
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[#181818]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Our Values</h2>
            <div className="w-24 h-1 bg-[#50BFF4] mx-auto" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, i) => (
              <div key={i} className="p-8 bg-[#252525] rounded-2xl text-center">
                <div className="p-4 bg-[#50BFF4]/10 rounded-xl inline-block mb-4">
                  <value.icon className="h-8 w-8 text-[#50BFF4]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#0f0f0f]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
            Join the Vetted Family
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Experience the Vetted difference for yourself. Book your discovery call today.
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
