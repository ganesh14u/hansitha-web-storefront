import React, { useState, useEffect, useRef } from "react";
import { FaAward, FaHeart, FaStar } from "react-icons/fa";
import { Footer } from "../components/Footer";
import { disableBodyScroll, clearAllBodyScrollLocks } from "body-scroll-lock";

const founderImageUrl =
  "https://res.cloudinary.com/duajnpevb/image/upload/v1753696486/b4aczypsgfqgye2sjlb1.jpg";

// --- Animated Counter Hook with Trigger ---
const useCountUpOnView = (end: number, duration: number, ref: React.RefObject<HTMLElement>) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = performance.now();

          const step = (timestamp: number) => {
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) requestAnimationFrame(step);
          };

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 } // Trigger when 30% visible
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, ref, hasAnimated]);

  return count;
};

const AboutPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const yearsRef = useRef<HTMLDivElement>(null);
  const customersRef = useRef<HTMLDivElement>(null);

  const years = useCountUpOnView(15, 3000, yearsRef);
  const customers = useCountUpOnView(5000, 3000, customersRef);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    const target = isSidebarOpen ? sidebarRef.current : null;
    if (target) {
      disableBodyScroll(target);
    } else {
      clearAllBodyScrollLocks();
    }
    return () => clearAllBodyScrollLocks();
  }, [isSidebarOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Main Content */}
      <main
        className="flex-grow font-serif text-gray-800"
        style={{
          background: "linear-gradient(to bottom right, #818cf8, #fca5a5)",
        }}
      >
        <div className="max-w-4xl mx-auto py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            {/* About Us Section */}
            <div className="mb-16">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                About Us
              </h1>
              <p className="text-xl leading-relaxed text-gray-700">
                Welcome to Hansitha Creations! We are a passionate team dedicated
                to delivering the finest fabrics and fashion collections tailored
                to your style. Our journey started with a vision to blend
                tradition with modern trends, offering quality and elegance in
                every product.
              </p>
              <p className="mt-4 text-xl leading-relaxed text-gray-700">
                Thank you for choosing us. We’re here to make your shopping
                experience seamless and delightful.
              </p>
            </div>

            {/* Craft Story Section */}
            <div className="mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                An Exclusive Destination for Handcrafted Sarees
              </h2>
              <p className="text-xl leading-relaxed text-gray-700">
                For over 15 years, Hansitha Creations has been the heart of
                traditional and contemporary saree design. Founded out of a
                sheer passion for sarees and hand-painting, we bring you a
                wonderful collection of hand-painted, embroidered, and
                block-printed sarees and dress materials.
              </p>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center mb-20">
              <div
                ref={yearsRef}
                className="bg-white/50 p-6 rounded-xl shadow-lg backdrop-blur-sm"
              >
                <FaAward className="mx-auto text-5xl text-purple-600 mb-4" />
                <p className="text-4xl font-bold text-gray-900">{years}+</p>
                <p className="text-lg text-gray-600">Years of Experience</p>
              </div>
              <div
                ref={customersRef}
                className="bg-white/50 p-6 rounded-xl shadow-lg backdrop-blur-sm"
              >
                <FaHeart className="mx-auto text-5xl text-pink-500 mb-4" />
                <p className="text-4xl font-bold text-gray-900">
                  {customers.toLocaleString()}+
                </p>
                <p className="text-lg text-gray-600">Happy Customers</p>
              </div>
              <div className="bg-white/50 p-6 rounded-xl shadow-lg backdrop-blur-sm">
                <FaStar className="mx-auto text-5xl text-yellow-500 mb-4" />
                <p className="text-4xl font-bold text-gray-900">Unique</p>
                <p className="text-lg text-gray-600">Designs</p>
              </div>
            </div>

            {/* Founder Section */}
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-8">
                Meet Our Founder
              </h2>
              <div className="flex flex-col items-center">
                <img
                  src={founderImageUrl}
                  alt="Kiranmai - Founder"
                  className="w-40 h-40 rounded-full object-cover mb-4 border-4 border-white shadow-xl"
                />
                <h3 className="text-3xl font-semibold text-gray-900">
                  Kiranmai
                </h3>
                <p className="text-xl text-gray-600">Founder & Designer</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AboutPage;
