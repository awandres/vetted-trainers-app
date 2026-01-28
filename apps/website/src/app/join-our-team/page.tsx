import { ArrowRight, CheckCircle, Mail } from "lucide-react";
import { VTNavigation, VTFooter } from "../../components";

const benefits = [
  "Competitive compensation with commission structure",
  "Private, state-of-the-art training facility",
  "Supportive team environment",
  "Ongoing education and development",
  "Flexible scheduling options",
  "Client referral program",
];

const requirements = [
  "Current personal training certification (NASM, ACE, NSCA, or equivalent)",
  "2+ years of personal training experience",
  "Excellent communication and interpersonal skills",
  "Passion for helping others achieve their fitness goals",
  "Knowledge of mobility and fascial techniques (preferred)",
  "CPR/AED certification",
];

export default function JoinOurTeamPage() {
  return (
    <div className="min-h-screen bg-[#181818] font-sans antialiased">
      <VTNavigation />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-[#0f0f0f] to-[#181818]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
            Join Our <span className="text-[#50BFF4]">Team</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Are you a passionate personal trainer looking to work with elite clients in a premier facility? We want to hear from you.
          </p>
        </div>
      </section>

      {/* Benefits & Requirements */}
      <section className="py-20 bg-[#181818]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Benefits */}
            <div className="p-8 bg-[#252525] rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">What We Offer</h2>
              <ul className="space-y-4">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#50BFF4] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div className="p-8 bg-[#252525] rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Requirements</h2>
              <ul className="space-y-4">
                {requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#50BFF4] rounded-full flex-shrink-0 mt-2" />
                    <span className="text-gray-300">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Apply CTA */}
      <section className="py-20 bg-[#252525]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
            Ready to Apply?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Send your resume and a brief introduction to join the Vetted Trainers team.
          </p>
          <a
            href="mailto:Tony@vettedtrainers.com?subject=Trainer Application"
            className="inline-flex items-center gap-2 bg-[#50BFF4] hover:bg-[#3DAEE3] text-black px-10 py-5 rounded-full font-bold text-lg transition-all hover:shadow-lg"
          >
            <Mail className="h-5 w-5" />
            Email Your Application
          </a>
          <p className="text-gray-500 text-sm mt-4">
            Email: Tony@vettedtrainers.com
          </p>
        </div>
      </section>

      {/* Already a Client? */}
      <section className="py-20 bg-[#181818]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Looking to Train with Us Instead?
          </h2>
          <a
            href="https://calendly.com/vetted-health/vetted-trainers-disco"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-2 border-[#50BFF4] text-[#50BFF4] hover:bg-[#50BFF4] hover:text-black px-8 py-4 rounded-full font-bold transition-all"
          >
            Book a Discovery Call
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>

      <VTFooter />
    </div>
  );
}
