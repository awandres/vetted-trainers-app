"use client";

import Image from "next/image";
import { ArrowRight, Calendar } from "lucide-react";
import { VTNavigation, VTFooter } from "../components";

const CALENDLY_URL = "https://calendly.com/vetted-health/vetted-trainers-disco";

// Vagaro scheduling links for each trainer (from vettedhealth.org)
const trainers = [
  {
    name: "Jose",
    fullName: "Jose Recio",
    image: "/images/vt/Trainer Headshots/Jose Recio Headshot.png",
    scheduleUrl: "https://www.vagaro.com//Users/BusinessWidget.aspx?enc=MMLjhIwJMcwFQhXLL7ifVM8aISXrVEkD6q0xWndNiYdw+xDBf2yDI40daks50PAgHg5F4ntHvq0svMvstd72gmk9pGgmm6VQlIwTBdBCpuig9NN/U9q7ES2zuiyah4qSHTY8ucymBjJxd/eDLWxqP9Z3Gqjwfova0JD/1ThJglQPaIDXdrv/EOTTIHrJZtd1fRmdbd5zom5QZa7O/BFpL/tAdqUD2DtrT20J7aop0WMwWCS3pgliJcuKq+jIgS20AWpE3KjN1ToxhOy95LKh/U8X29Wv2/BVRUI/75JQ+XAR1o+hz+SIAf8AgKeHx5Bn0QmGuAUM6GW/Nb/UUS2IgQguMMPJKZl4r9mxBRbBZM1arr8n4bLUtB4QOtyrs0W3zsyDEX3FhiA8KdW09npOdHwK+rmCSP1AJEcAIfOd+FJPaQU7dxkvOMU7S/tQb4um",
  },
  {
    name: "Kade",
    fullName: "Kade Arrington",
    image: "/images/vt/Trainer Headshots/Kade Arrington(1).png",
    scheduleUrl: "https://www.vagaro.com//Users/BusinessWidget.aspx?enc=MMLjhIwJMcwFQhXLL7ifVM8aISXrVEkD6q0xWndNiYdw+xDBf2yDI40daks50PAgHg5F4ntHvq0svMvstd72gmk9pGgmm6VQlIwTBdBCpuig9NN/U9q7ES2zuiyah4qSHTY8ucymBjJxd/eDLWxqP9Z3Gqjwfova0JD/1ThJglQPaIDXdrv/EOTTIHrJZtd1fRmdbd5zom5QZa7O/BFpL/tAdqUD2DtrT20J7aop0WMwWCS3pgliJcuKq+jIgS20AWpE3KjN1ToxhOy95LKh/U8X29Wv2/BVRUI/75JQ+XAR1o+hz+SIAf8AgKeHx5Bn0QmGuAUM6GW/Nb/UUS2IgQguMMPJKZl4r9mxBRbBZM36WIPSzCOHKMFO34yKa+G+G3qmMPx+UbMrgcbb7RFUMxjQdmryT+7IdY6LZLfaPZH0XPLZ9KXkTgOWDzPznEVs",
  },
  {
    name: "Michael",
    fullName: "Michael Coleman",
    image: "/images/vt/Trainer Headshots/Michael Coleman Head Shot.png",
    scheduleUrl: "https://www.vagaro.com//Users/BusinessWidget.aspx?enc=MMLjhIwJMcwFQhXLL7ifVM8aISXrVEkD6q0xWndNiYdw+xDBf2yDI40daks50PAgHg5F4ntHvq0svMvstd72gmk9pGgmm6VQlIwTBdBCpuig9NN/U9q7ES2zuiyah4qSHTY8ucymBjJxd/eDLWxqP9Z3Gqjwfova0JD/1ThJglQPaIDXdrv/EOTTIHrJZtd1fRmdbd5zom5QZa7O/BFpL/tAdqUD2DtrT20J7aop0WMwWCS3pgliJcuKq+jIgS20AWpE3KjN1ToxhOy95LKh/U8X29Wv2/BVRUI/75JQ+XAR1o+hz+SIAf8AgKeHx5Bn0QmGuAUM6GW/Nb/UUS2IgQguMMPJKZl4r9mxBRbBZM3zmzworsrhnZ/cQTIw3lSatHhqB24u+DtcA1tQnvqWizOMXtMxn/eMGBastC2KPqcKd6HONtjhjfA05RZwTo79cn+495BkQBgZHXPGhSaY7OufU2DvFHx/XJ3Ub5gcKxA=",
  },
  {
    name: "Youssef",
    fullName: "Youssef Salem",
    image: "/images/vt/Trainer Headshots/Youssef Salem Headshot.png",
    scheduleUrl: "https://www.vagaro.com//Users/BusinessWidget.aspx?enc=MMLjhIwJMcwFQhXLL7ifVM8aISXrVEkD6q0xWndNiYdw+xDBf2yDI40daks50PAgHg5F4ntHvq0svMvstd72gmk9pGgmm6VQlIwTBdBCpuig9NN/U9q7ES2zuiyah4qSHTY8ucymBjJxd/eDLWxqP9Z3Gqjwfova0JD/1ThJglQPaIDXdrv/EOTTIHrJZtd1fRmdbd5zom5QZa7O/BFpL/tAdqUD2DtrT20J7aop0WMwWCS3pgliJcuKq+jIgS20AWpE3KjN1ToxhOy95LKh/U8X29Wv2/BVRUI/75JQ+XAR1o+hz+SIAf8AgKeHx5Bn0QmGuAUM6GW/Nb/UUS2IgQguMMPJKZl4r9mxBRbBZM2wErbvUSwkHYyWF3tQNkKC68vbEKzXyP6csUw07P2/Jr57xHnGBu7vq1MjCAjefwnPVxC5SxqQ1xi0+8RTq9iRuMu6VpD502/kTa+BiDTLzIn7oQ7CijM43hkxV9kh9jo=",
  },
  {
    name: "Lex",
    fullName: "Lex Titus",
    image: "/images/vt/Trainer Headshots/Lex Titus headshot.png",
    scheduleUrl: "https://www.vagaro.com//Users/BusinessWidget.aspx?enc=MMLjhIwJMcwFQhXLL7ifVM8aISXrVEkD6q0xWndNiYdw+xDBf2yDI40daks50PAgHg5F4ntHvq0svMvstd72gmk9pGgmm6VQlIwTBdBCpuig9NN/U9q7ES2zuiyah4qSHTY8ucymBjJxd/eDLWxqP9Z3Gqjwfova0JD/1ThJglQPaIDXdrv/EOTTIHrJZtd1fRmdbd5zom5QZa7O/BFpL/tAdqUD2DtrT20J7aop0WMwWCS3pgliJcuKq+jIgS20AWpE3KjN1ToxhOy95LKh/U8X29Wv2/BVRUI/75JQ+XAR1o+hz+SIAf8AgKeHx5Bn0QmGuAUM6GW/Nb/UUS2IgQguMMPJKZl4r9mxBRbBZM0y7FhOAtNBFl/ENd57zAXFl0ZuAK64eAGiMXd9AfQV1cCUHrpS5UcVF91aE+AWSopBlcuwrwCo4V5fdyFIVHUJ",
  },
  {
    name: "Shane",
    fullName: "Shane Mullen",
    image: "/images/vt/Trainer Headshots/Shane Mullen Headshot.png",
    scheduleUrl: "https://www.vagaro.com//Users/BusinessWidget.aspx?enc=MMLjhIwJMcwFQhXLL7ifVM8aISXrVEkD6q0xWndNiYdw+xDBf2yDI40daks50PAgHg5F4ntHvq0svMvstd72gmk9pGgmm6VQlIwTBdBCpuig9NN/U9q7ES2zuiyah4qSHTY8ucymBjJxd/eDLWxqP9Z3Gqjwfova0JD/1ThJglQPaIDXdrv/EOTTIHrJZtd1fRmdbd5zom5QZa7O/BFpL/tAdqUD2DtrT20J7aop0WMwWCS3pgliJcuKq+jIgS20AWpE3KjN1ToxhOy95LKh/U8X29Wv2/BVRUI/75JQ+XAR1o+hz+SIAf8AgKeHx5Bn0QmGuAUM6GW/Nb/UUS2IgQguMMPJKZl4r9mxBRbBZM1bdKfDt1cPUwKC/tVTPrfURTFLaoh98QcHec7bU8BuHnX1o8WxwoghQHSK/E0VIZcx+JKwdtS3CM9CNfa3wQNF",
  },
  {
    name: "Ben",
    fullName: "Ben Sicat",
    image: "/images/vt/Trainer Headshots/Ben Sicat headshot.png",
    scheduleUrl: "https://www.vagaro.com//Users/BusinessWidget.aspx?enc=MMLjhIwJMcwFQhXLL7ifVM8aISXrVEkD6q0xWndNiYdw+xDBf2yDI40daks50PAgHg5F4ntHvq0svMvstd72gmk9pGgmm6VQlIwTBdBCpuig9NN/U9q7ES2zuiyah4qSHTY8ucymBjJxd/eDLWxqP9Z3Gqjwfova0JD/1ThJglQPaIDXdrv/EOTTIHrJZtd1fRmdbd5zom5QZa7O/BFpL/tAdqUD2DtrT20J7aop0WMwWCS3pgliJcuKq+jIgS20AWpE3KjN1ToxhOy95LKh/U8X29Wv2/BVRUI/75JQ+XAR1o+hz+SIAf8AgKeHx5Bn0QmGuAUM6GW/Nb/UUS2IgQguMMPJKZl4r9mxBRbBZM2FDcHXqohU6kM/6adyJNB6h1kClFL+WSbrNswUBmWHc9YyaosPJgSdtogdcevjRUrVXt9ktTKO0x+ASY9uL5Sf",
  },
  {
    name: "Nick",
    fullName: "Nick Rispoli",
    image: "/images/vt/Trainer Headshots/Nick Rispoli Headshot.png",
    scheduleUrl: "https://www.vagaro.com//Users/BusinessWidget.aspx?enc=MMLjhIwJMcwFQhXLL7ifVM8aISXrVEkD6q0xWndNiYdw+xDBf2yDI40daks50PAgHg5F4ntHvq0svMvstd72gmk9pGgmm6VQlIwTBdBCpuig9NN/U9q7ES2zuiyah4qSHTY8ucymBjJxd/eDLWxqP9Z3Gqjwfova0JD/1ThJglQPaIDXdrv/EOTTIHrJZtd1fRmdbd5zom5QZa7O/BFpL/tAdqUD2DtrT20J7aop0WMwWCS3pgliJcuKq+jIgS20AWpE3KjN1ToxhOy95LKh/U8X29Wv2/BVRUI/75JQ+XAR1o+hz+SIAf8AgKeHx5Bn0QmGuAUM6GW/Nb/UUS2IgQguMMPJKZl4r9mxBRbBZM3z3kjZuSi4G69u1Oiw0hUN9YwDhtEnwRUGWujlgTp71UYotLnYWeGxoemUZZCFPXPlhFN4UTjcYUQwWGy/qsyl",
  },
  {
    name: "Jae",
    fullName: "Jaelyn Blanc",
    image: "/images/vt/Trainer Headshots/Jaelyn Blanc headshot.png",
    scheduleUrl: "https://www.vagaro.com//Users/BusinessWidget.aspx?enc=MMLjhIwJMcwFQhXLL7ifVM8aISXrVEkD6q0xWndNiYdw+xDBf2yDI40daks50PAgHg5F4ntHvq0svMvstd72gmk9pGgmm6VQlIwTBdBCpujW/qE//U1E4jOc7j8U/G3G7ZDAG93d/90M/2+t17WFJY8nFZb2Jjj8nPmksaxxhPNRGdDqe0IBBmed3YLfHnu79PLSZG4hrkDMvJu8RyEfOz6dOCM9owtCsMF2M+14aJ2cAI+ivEU4+uLLT9UxjJgp8hiZObL/jNe15muF2dH5StBqYy+IWedl0xWH6ZpBGHTEihsqAUrDAGB7d5jZ/WKDt/Yh+35aUXwMrPgUkO8vg0C0dph4H6GdwfZnfdu73+5eo8g/RoFuN+9+f2EMYEZr2hZ7ACJmSJTp3sfa7T9U1BEmy1MM7IetbQmLlxjjLEQ9k4Ys+rr+CwwPMRUINMPypIzF2sZ3kqnb26WhcIqZMA==",
  },
  {
    name: "Matthew",
    fullName: "Matthew Albano",
    image: "/images/vt/Trainer Headshots/Matt-Albano.webp",
    scheduleUrl: "https://www.vagaro.com//Users/BusinessWidget.aspx?enc=MMLjhIwJMcwFQhXLL7ifVM8aISXrVEkD6q0xWndNiYdw+xDBf2yDI40daks50PAgHg5F4ntHvq0svMvstd72gmk9pGgmm6VQlIwTBdBCpuig9NN/U9q7ES2zuiyah4qSHTY8ucymBjJxd/eDLWxqP9Z3Gqjwfova0JD/1ThJglQPaIDXdrv/EOTTIHrJZtd1fRmdbd5zom5QZa7O/BFpL/tAdqUD2DtrT20J7aop0WMwWCS3pgliJcuKq+jIgS20AWpE3KjN1ToxhOy95LKh/U8X29Wv2/BVRUI/75JQ+XAR1o+hz+SIAf8AgKeHx5Bn0QmGuAUM6GW/Nb/UUS2IgQguMMPJKZl4r9mxBRbBZM0ALUosOJawKMb/DZYfIueDC1Awik1frM05e+5TfMRIe7wtS5VrxxFG3SceEJll2JtXYGLhO7e3skhtBJTeJvI4gQctMUYXFtZsxULr6eeBCamlsIFs18k5Fom/XyPs6k4=",
  },
  {
    name: "Luke",
    fullName: "Luke Boyds",
    image: "/images/vt/Trainer Headshots/Luke Boyds headshot.png",
    scheduleUrl: "https://www.vagaro.com/Users/BusinessWidget.aspx?enc=MMLjhIwJMcwFQhXLL7ifVM8aISXrVEkD6q0xWndNiYdw+xDBf2yDI40daks50PAgHg5F4ntHvq0svMvstd72gmk9pGgmm6VQlIwTBdBCpuj/K+Z/UQKQ2fQOg7AOqLyJAhQsH7lTOlG0MVq8uh7ANo+bNhTUy8aViLcDgc4ZzPEGCfs6CVYzn0Kmb3QALwVTL4Y2VmXGjy4Age/+XKLB5oSeFn0mOtM08/CE+XjEwKX82hTaBxsoiiEFx0P1wbZr5OCuD3ej05Tgqc5vpv550m+TH66XmUYW7jSmDLDvOkwv3h27cjasbtBvujPgu7kyQ4LmDRbcKkd4aMRySfMvoi9fobQCabovnWt89qV9oWYxBrYXxoBrfPln0ImLSwYBJQ4esH5B1eEQKBP7tkDI+itFsGEulm961c3cUvDNjeTGoAFyMk9NPP8akfr5LMkmi7rR/NzVdJzPG4nBjxayZt5tojc7qHDajxzHcCrpMSPYOMmAZqjzx4ZH9xbdJ/2vSVCM2Hc/2RpSGQbAk8svAChXRvhFHJKGXosEYsQywr8=",
  },
  {
    name: "Tony",
    fullName: "Tony Bianchini",
    image: "/images/vt/Trainer Headshots/Tony Bianchini(2).png",
    scheduleUrl: "https://www.vagaro.com//Users/BusinessWidget.aspx?enc=MMLjhIwJMcwFQhXLL7ifVM8aISXrVEkD6q0xWndNiYdw+xDBf2yDI40daks50PAgHg5F4ntHvq0svMvstd72gmk9pGgmm6VQlIwTBdBCpuig9NN/U9q7ES2zuiyah4qSHTY8ucymBjJxd/eDLWxqP9Z3Gqjwfova0JD/1ThJglQPaIDXdrv/EOTTIHrJZtd1fRmdbd5zom5QZa7O/BFpL/tAdqUD2DtrT20J7aop0WMwWCS3pgliJcuKq+jIgS20AWpE3KjN1ToxhOy95LKh/U8X29Wv2/BVRUI/75JQ+XAR1o+hz+SIAf8AgKeHx5Bn0QmGuAUM6GW/Nb/UUS2IgQguMMPJKZl4r9mxBRbBZM2oA2cqU+Md0jprr1L4Yqdl4N3BQxifWJRPLUp0yvsNFwFY/l2Awg7DGhn1A43tHYGx2caziw9XYjBlwhLEcoFhhjZdaSoRlwU61l1eo0kMIVM9tspvvJpwPg+RFVjqdsQ=",
  },
  {
    name: "Will",
    fullName: "Will Albritton",
    image: "/images/vt/Trainer Headshots/Will Albritton .png",
    scheduleUrl: "https://www.vagaro.com/Users/BusinessWidget.aspx?enc=MMLjhIwJMcwFQhXLL7ifVM8aISXrVEkD6q0xWndNiYdw+xDBf2yDI40daks50PAgHg5F4ntHvq0svMvstd72gmk9pGgmm6VQlIwTBdBCpujW/qE//U1E4jOc7j8U/G3G7ZDAG93d/90M/2+t17WFJY8nFZb2Jjj8nPmksaxxhPNRGdDqe0IBBmed3YLfHnu79PLSZG4hrkDMvJu8RyEfOz6dOCM9owtCsMF2M+14aJ2cAI+ivEU4+uLLT9UxjJgp8hiZObL/jNe15muF2dH5StBqYy+IWedl0xWH6ZpBGHTEihsqAUrDAGB7d5jZ/WKDt/Yh+35aUXwMrPgUkO8vg4npLbSzZdrWm4tSnbzvGFaXsOtKPnB+4cnRn/myDAGMOn3tYSzfBxe8gh4J5pGFKbPmEZ/1wvwrwKeMLv4umFnUTE02rhaJeU0LtpbiglJQh5EN1TeeSusYIaMAUwhyh47TAXrTPxrfSeohEewR+qzA7f+5kgPA/X6Qn17SBje+oK1UNP2DuDrF2GbO5CSxGA==",
  },
  {
    name: "Joey",
    fullName: "Joey Bomango",
    image: "/images/vt/Trainer Headshots/Joey Bomango.png",
    scheduleUrl: "https://www.vagaro.com//Users/BusinessWidget.aspx?enc=MMLjhIwJMcwFQhXLL7ifVM8aISXrVEkD6q0xWndNiYdw+xDBf2yDI40daks50PAgHg5F4ntHvq0svMvstd72gmk9pGgmm6VQlIwTBdBCpuig9NN/U9q7ES2zuiyah4qSHTY8ucymBjJxd/eDLWxqP9Z3Gqjwfova0JD/1ThJglQPaIDXdrv/EOTTIHrJZtd1fRmdbd5zom5QZa7O/BFpL/tAdqUD2DtrT20J7aop0WMwWCS3pgliJcuKq+jIgS20AWpE3KjN1ToxhOy95LKh/U8X29Wv2/BVRUI/75JQ+XAR1o+hz+SIAf8AgKeHx5Bn0QmGuAUM6GW/Nb/UUS2IgQguMMPJKZl4r9mxBRbBZM3sLtLXI+HVcJbuQSemjJ23rg8p9BYsn97W1P/Z3c1evTaF+arHNxxqYxBAPQf3L5/xdVDJi1oRxvUrEmWFuiPK",
  },
];

function TrainerCard({ trainer }: { trainer: typeof trainers[0] }) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Card with image only */}
      <div className="bg-[#252525] rounded-2xl overflow-hidden w-full">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={trainer.image}
            alt={`${trainer.fullName} - Vetted Trainer`}
            fill
            className="object-cover object-top"
          />
        </div>
      </div>

      {/* Name below the card */}
      <h3 className="text-2xl font-bold text-white mt-4">{trainer.name}</h3>

      {/* Button below the name */}
      <a
        href={trainer.scheduleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center justify-center gap-2 bg-[#50BFF4] hover:bg-[#3DAEE3] text-black px-6 py-3 rounded-full font-bold transition-all hover:shadow-lg w-full"
      >
        <Calendar className="h-4 w-4" />
        Schedule with {trainer.name}
      </a>
    </div>
  );
}

export default function VTPersonalTrainersPage() {
  return (
    <div className="min-h-screen bg-[#181818] font-sans antialiased">
      {/* Navigation */}
      <VTNavigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 bg-[#181818]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
              Personal <span className="text-[#50BFF4]">Trainers</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Our team of expert trainers is ready to guide you on your fitness journey. 
              Click on any trainer to schedule your session.
            </p>
            <div className="w-24 h-1 bg-[#50BFF4] mx-auto" />
          </div>
        </div>
      </section>

      {/* Team Photo Section */}
      <section className="py-12 bg-[#252525]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/images/vt/Trainer Headshots/Team Photo.jpeg"
              alt="The Vetted Trainers team"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Trainers Grid */}
      <section className="py-20 bg-[#181818]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Row 1 - 3 trainers */}
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {trainers.slice(0, 3).map((trainer) => (
              <TrainerCard key={trainer.name} trainer={trainer} />
            ))}
          </div>

          {/* Row 2 - 3 trainers */}
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {trainers.slice(3, 6).map((trainer) => (
              <TrainerCard key={trainer.name} trainer={trainer} />
            ))}
          </div>

          {/* Row 3 - 3 trainers */}
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {trainers.slice(6, 9).map((trainer) => (
              <TrainerCard key={trainer.name} trainer={trainer} />
            ))}
          </div>

          {/* Row 4 - 3 trainers */}
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {trainers.slice(9, 12).map((trainer) => (
              <TrainerCard key={trainer.name} trainer={trainer} />
            ))}
          </div>

          {/* Row 5 - remaining trainers (centered) */}
          <div className="flex flex-wrap justify-center gap-8">
            {trainers.slice(12).map((trainer) => (
              <div key={trainer.name} className="w-full md:w-[calc(33.333%-1.5rem)]">
                <TrainerCard trainer={trainer} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#252525]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
            Not Sure Who to Train With?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Request a consultation and we&apos;ll match you with the perfect trainer for your goals.
          </p>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#50BFF4] hover:bg-[#3DAEE3] text-black px-10 py-5 rounded-full font-bold text-lg transition-all hover:shadow-lg hover:shadow-[#50BFF4]/30 hover:scale-105"
          >
            Request Consultation
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <VTFooter />
    </div>
  );
}
