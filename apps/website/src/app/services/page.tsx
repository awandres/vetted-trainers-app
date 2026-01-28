import Image from "next/image";
import { ArrowRight, Dumbbell, Scale, Video, Users, Clock, Award } from "lucide-react";
import { VTNavigation, VTFooter } from "../../components";

const CALENDLY_URL = "https://calendly.com/vetted-health/vetted-trainers-disco";

const services = [
  {
    icon: Dumbbell,
    title: "Private Gym Personal Training",
    description: "Experience our award-winning In-Gym Personal Training at our private facility. We combine fascial techniques with tailored workouts to enhance your functional strength. Every session is customized to your goals, fitness level, and unique body mechanics.",
    features: ["One-on-one dedicated attention", "Private, members-only facility", "Fascial release techniques", "Strength & mobility integration"],
    image: "/images/personal-training-1.jpg",
    calendlyUrl: CALENDLY_URL,
  },
  {
    icon: Scale,
    title: "Weight Loss Programs",
    description: "Transform your body with Vetted Trainers' comprehensive Weight Loss Programs. We combine nutrition guidance, tissue work, and personalized workouts designed for sustainable results. Our approach addresses gut health, metabolism, and building lean muscle.",
    features: ["Nutrition coaching", "Body composition analysis", "Sustainable approach", "Ongoing support & accountability"],
    image: "/images/personal-training-2.jpg",
    calendlyUrl: "https://calendly.com/vetted-health/weightloss-program-discovery-call",
  },
  {
    icon: Video,
    title: "Virtual Training",
    description: "Can't make it to our gym? Join remotely for a mobility, flexibility, and strength workout guided by your Vetted Trainer from anywhere in the world. Get the same quality coaching and personalized programming from the comfort of your home.",
    features: ["Live coaching sessions", "Flexible scheduling", "No equipment needed options", "Progress tracking"],
    image: "/images/virtual-training.jpg",
    calendlyUrl: CALENDLY_URL,
  },
];

const benefits = [
  { icon: Users, title: "Expert Trainers", description: "Our team has 15+ years of combined experience" },
  { icon: Clock, title: "Flexible Schedule", description: "Early morning to evening appointments available" },
  { icon: Award, title: "Proven Results", description: "1000+ clients transformed" },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#181818] font-sans antialiased">
      <VTNavigation />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-[#0f0f0f] to-[#181818]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
            Our <span className="text-[#50BFF4]">Services</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Discover the training program that&apos;s right for you. Every service is designed to help you move better, feel better, and achieve lasting results.
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-[#181818]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            {services.map((service, i) => (
              <div
                key={i}
                className={`grid md:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}
              >
                <div className={i % 2 === 1 ? "md:order-2" : ""}>
                  <div className="p-3 bg-[#50BFF4] rounded-xl inline-block mb-4">
                    <service.icon className="h-8 w-8 text-black" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{service.title}</h2>
                  <p className="text-gray-400 mb-6 leading-relaxed">{service.description}</p>
                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-3 text-gray-300">
                        <span className="w-2 h-2 bg-[#50BFF4] rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={service.calendlyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#50BFF4] hover:bg-[#3DAEE3] text-black px-8 py-4 rounded-full font-bold transition-all hover:shadow-lg"
                  >
                    Book Now
                    <ArrowRight className="h-5 w-5" />
                  </a>
                </div>
                <div className={`relative aspect-[4/3] rounded-2xl overflow-hidden ${i % 2 === 1 ? "md:order-1" : ""}`}>
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-[#252525]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Why Choose <span className="text-[#50BFF4]">Vetted Trainers</span>?
            </h2>
            <div className="w-24 h-1 bg-[#50BFF4] mx-auto" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, i) => (
              <div key={i} className="text-center p-8 bg-[#181818] rounded-2xl">
                <div className="p-4 bg-[#50BFF4]/10 rounded-xl inline-block mb-4">
                  <benefit.icon className="h-8 w-8 text-[#50BFF4]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#181818]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Book your discovery call today and let&apos;s find the perfect program for you.
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
