"use client";

import Image from "next/image";
import { ArrowRight, Video, Dumbbell, Scale } from "lucide-react";
import { VTNavigation, VTFooter } from "../components";

const CALENDLY_URL = "https://calendly.com/vetted-health/vetted-trainers-disco";

// Services ordered: Private Gym first, Weight Loss second, Virtual last
const services = [
  {
    id: "PersonalTraining",
    icon: Dumbbell,
    title: "Private Gym Personal Training",
    shortDescription: "Our signature training experience",
    fullDescription: "Our award-winning In-Gym Personal Training service integrates advanced fascial techniques with tailored workouts to improve your functional strength. Every session starts with myofascial release on a massage table to prep your tissues for the workout. Train in our private, members-only facility with state-of-the-art equipment and one-on-one attention from your dedicated trainer.",
    image: "/images/vt/Personal Training Service/personal-training-1.JPG",
    cta: "SIGN ME UP",
    features: [
      "Private, members-only facility",
      "One-on-one attention",
      "State-of-the-art equipment",
      "Myofascial release included",
      "Personalized programs",
    ],
  },
  {
    id: "WeightLoss",
    icon: Scale,
    title: "Weight Loss Programs",
    shortDescription: "Transform your body sustainably",
    fullDescription: "Transform your body with Vetted Trainers' comprehensive Weight Loss Programs in Frederick, Maryland. Our approach combines personalized nutrition guidance, tissue work, and strategic workouts designed for sustainable fat loss. Let Vetted Trainers guide you through a proven system that delivers lasting results tailored to your lifestyle and goals.",
    image: "/images/vt/Personal Training Service/personal-training-2.JPG",
    cta: "I'M READY",
    features: [
      "Personalized nutrition guidance",
      "Strategic fat-loss workouts",
      "Tissue work included",
      "Progress tracking",
      "Sustainable results",
    ],
  },
  {
    id: "VirtualTraining",
    icon: Video,
    title: "Virtual Training",
    shortDescription: "Train from anywhere",
    fullDescription: "Can't make it to our Frederick gym? Experience the flexibility of fitness from anywhere with Vetted Trainers' Virtual Training Service. Our expert trainers will guide you through comprehensive full-body workouts, designed to be executed with or without equipment. Perfect for traveling clients or those who prefer the convenience of home.",
    image: "/images/vt/VT-33.jpg",
    cta: "GO VIRTUAL",
    features: [
      "Train from anywhere",
      "No equipment required",
      "Live video sessions",
      "Custom workout plans",
      "Flexible scheduling",
    ],
  },
];

export default function VTServicesPage() {
  return (
    <div className="min-h-screen bg-[#181818] font-sans antialiased">
      {/* Navigation */}
      <VTNavigation />

      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/vt/Building images/gym-room.JPG"
            alt="Vetted Trainers private gym"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[#181818]/85" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
              Our <span className="text-[#50BFF4]">Services</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Train at our private, members-only gym in Frederick, MD, or choose the option 
              that fits your lifestyle. Every modality delivers expert guidance and personalized attention.
            </p>
          </div>
        </div>
      </section>

      {/* Service Cards Navigation */}
      <section className="py-12 bg-[#252525]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {services.map((service) => (
              <a
                key={service.id}
                href={`#${service.id}`}
                className="group bg-[#181818] rounded-2xl p-6 hover:bg-[#1f1f1f] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#50BFF4]/10"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-[#50BFF4] rounded-xl">
                    <service.icon className="h-6 w-6 text-black" />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-[#50BFF4] transition-colors">
                    {service.title}
                  </h3>
                </div>
                <p className="text-gray-400 text-sm">{service.shortDescription}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Service Sections */}
      {services.map((service, index) => (
        <section
          key={service.id}
          id={service.id}
          className={`py-20 ${index % 2 === 0 ? "bg-[#181818]" : "bg-[#252525]"}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`grid md:grid-cols-2 gap-12 items-center`}>
              {/* Content */}
              <div className={index % 2 === 1 ? "md:order-2" : ""}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-[#50BFF4] rounded-xl">
                    <service.icon className="h-6 w-6 text-black" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white">
                    {service.title}
                  </h2>
                </div>
                <p className="text-lg text-gray-300 leading-relaxed mb-8">
                  {service.fullDescription}
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-300">
                      <span className="w-2 h-2 bg-[#50BFF4] rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#50BFF4] hover:bg-[#3DAEE3] text-black px-8 py-4 rounded-full font-bold transition-all hover:shadow-lg hover:scale-105"
                >
                  {service.cta}
                  <ArrowRight className="h-5 w-5" />
                </a>
              </div>

              {/* Image */}
              <div className={`relative ${index % 2 === 1 ? "md:order-1" : ""}`}>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div 
                  className={`absolute -z-10 w-32 h-32 bg-[#50BFF4] rounded-2xl ${
                    index % 2 === 0 
                      ? "-bottom-4 -right-4" 
                      : "-bottom-4 -left-4"
                  }`} 
                />
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Facility Section */}
      <section className="py-20 bg-[#181818]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Our <span className="text-[#50BFF4]">Facility</span>
            </h2>
            <div className="w-24 h-1 bg-[#50BFF4] mx-auto mb-6" />
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Train in our private, members-only gym located in Frederick, Maryland.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="/images/vt/Building images/building-exterior.JPG"
                alt="Vetted Trainers gym exterior"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="/images/vt/Building images/front-desk.JPG"
                alt="Vetted Trainers front desk"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="/images/vt/Building images/stretch-beds.JPG"
                alt="Myofascial release area"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#252525]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
            Not Sure Which Service Is Right For You?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Schedule a complimentary consultation and we&apos;ll help you find the perfect training option 
            for your goals, schedule, and lifestyle.
          </p>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#50BFF4] hover:bg-[#3DAEE3] text-black px-10 py-5 rounded-full font-bold text-lg transition-all hover:shadow-lg hover:shadow-[#50BFF4]/30 hover:scale-105"
          >
            Request Complimentary Consultation
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <VTFooter />
    </div>
  );
}
