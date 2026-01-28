import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Dumbbell, Scale, Video, ChevronRight } from "lucide-react";
import { VTNavigation, VTFooter } from "../components";

const CALENDLY_URL = "https://calendly.com/vetted-health/vetted-trainers-disco";

const services = [
  {
    icon: Dumbbell,
    title: "Private Gym Personal Training",
    description: "Experience our award-winning In-Gym Personal Training at our private facility. We combine fascial techniques with tailored workouts to enhance your functional strength.",
    image: "/images/personal-training-1.jpg",
    cta: "BOOK NOW",
  },
  {
    icon: Scale,
    title: "Weight Loss Programs",
    description: "Transform your body with Vetted Trainers' Weight Loss Programs in Frederick, Maryland. We combine nutrition guidance, tissue work, and personalized workouts designed for sustainable results.",
    image: "/images/personal-training-2.jpg",
    cta: "SCHEDULE",
  },
  {
    icon: Video,
    title: "Virtual Training",
    description: "Can't make it to our gym? Join remotely for a mobility, flexibility, and strength workout guided by your Vetted Trainer from anywhere in the world.",
    image: "/images/virtual-training.jpg",
    cta: "SIGN UP",
  },
];

const stats = [
  { value: "15+", label: "Years Experience" },
  { value: "1000+", label: "Clients Trained" },
  { value: "3", label: "Training Options" },
  { value: "100%", label: "Dedication" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#181818] font-sans antialiased">
      <VTNavigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-bg.jpg"
            alt="Personal training at Vetted Trainers"
            fill
            priority
            quality={85}
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#181818]/70 via-[#181818]/50 to-[#181818]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6 drop-shadow-2xl">
            Are you ready to <span className="text-[#50BFF4]">FEEL</span> better, <span className="text-[#50BFF4]">MOVE</span> better, and <span className="text-[#50BFF4]">BE</span> better?
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 font-light">
            Train at our private, members-only gym in Frederick, Maryland. Vetted Trainers are dedicated to your success with personalized programs that get results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#50BFF4] hover:bg-[#3DAEE3] text-black px-8 py-4 rounded-full font-bold text-lg transition-all hover:shadow-lg hover:shadow-[#50BFF4]/30 hover:scale-105 flex items-center justify-center gap-2"
            >
              Get Vetted!
              <ArrowRight className="h-5 w-5" />
            </a>
            <Link
              href="/services"
              className="w-full sm:w-auto border-2 border-white/30 hover:border-white/60 text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:bg-white/5 text-center"
            >
              View Services
            </Link>
          </div>
        </div>
      </section>

      {/* What is Vetted Trainers Section */}
      <section className="py-20 bg-[#181818]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
              WHAT IS <span className="text-[#50BFF4]">VETTED TRAINERS</span>?
            </h2>
            <div className="w-24 h-1 bg-[#50BFF4] mx-auto mb-8" />
            <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Vetted Trainers is a team of top-notch trainers who combine the best of strength training, mobility, and tissue work to optimize your human movement. Train at our private, appointment-only gym in Frederick, MD, or let us bring the workout to you with weight loss programs and virtual options.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl md:text-5xl font-black text-[#50BFF4] mb-2">{stat.value}</div>
                <div className="text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Our Mission */}
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">OUR MISSION</h2>
            <div className="w-24 h-1 bg-[#50BFF4] mx-auto mb-8" />
            <p className="text-lg text-gray-400 max-w-4xl mx-auto leading-relaxed">
              At Vetted Trainers, our mission is to deliver unparalleled personal training, providing our elite members with a bespoke, top-tier fitness experience.
            </p>
          </div>
        </div>
      </section>

      {/* Full Width Gym Image */}
      <section className="relative h-[50vh] md:h-[60vh]">
        <Image
          src="/images/gym-room.jpg"
          alt="Vetted Trainers private gym facility in Frederick, MD"
          fill
          quality={85}
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#181818] via-transparent to-[#181818]" />
      </section>

      {/* Services Section */}
      <section className="py-20 bg-[#252525]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
              Personal Training <span className="text-[#50BFF4]">Services</span>
            </h2>
            <div className="w-24 h-1 bg-[#50BFF4] mx-auto" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <a
                key={i}
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-[#181818] rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-[#50BFF4]/10 transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#181818] to-transparent" />
                  <div className="absolute top-4 left-4 p-3 bg-[#50BFF4] rounded-xl">
                    <service.icon className="h-6 w-6 text-black" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                  <p className="text-gray-400 mb-6 text-sm leading-relaxed">{service.description}</p>
                  <div className="inline-flex items-center gap-2 text-[#50BFF4] font-bold group-hover:gap-3 transition-all">
                    {service.cta}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-white border-2 border-white/30 hover:border-[#50BFF4] hover:text-[#50BFF4] px-8 py-4 rounded-full font-bold transition-all"
            >
              View All Services
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Weight Loss Section */}
      <section className="py-20 bg-[#181818]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6">
                Weight Loss <span className="text-[#50BFF4]">Journey</span>
              </h2>
              <div className="text-xl text-gray-300 italic mb-8 border-l-4 border-[#50BFF4] pl-6">
                Our Philosophy: We teach people to feed their body and good bacteria in a sustainable way that promotes a healthy gut which promotes fat loss and lean muscle growth.
              </div>
              <a
                href="https://calendly.com/vetted-health/weightloss-program-discovery-call"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#50BFF4] hover:bg-[#3DAEE3] text-black px-8 py-4 rounded-full font-bold transition-all hover:shadow-lg"
              >
                Weight Loss Consultation
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#181818]">
              <Image
                src="/images/weight-loss.jpg"
                alt="Weight Loss and Body Composition"
                fill
                className="object-contain"
              />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#50BFF4] rounded-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: "url('/images/chalk-hands.png')" }}
        />
        <div className="absolute inset-0 bg-[#181818]/90" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6">
            Ready to Transform Your <span className="text-[#50BFF4]">Fitness</span>?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join our private, members-only gym and start training with Frederick&apos;s premier personal trainers.
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

      <VTFooter />
    </div>
  );
}
