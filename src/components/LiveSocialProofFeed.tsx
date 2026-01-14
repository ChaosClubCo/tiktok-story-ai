import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, Users } from "lucide-react";

interface ProofItem {
  id: number;
  name: string;
  action: string;
  icon: "sparkles" | "trending" | "users";
  color: "primary" | "secondary" | "info";
}

export const LiveSocialProofFeed = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const proofItems: ProofItem[] = [
    {
      id: 1,
      name: "Sarah M.",
      action: "generated a 10-episode romance series",
      icon: "sparkles",
      color: "primary",
    },
    {
      id: 2,
      name: "Mike Chen",
      action: "script predicted 95% viral score",
      icon: "trending",
      color: "secondary",
    },
    {
      id: 3,
      name: "Drama Queens",
      action: "team published 5 scripts today",
      icon: "users",
      color: "info",
    },
    {
      id: 4,
      name: "Jessica R.",
      action: "earned $2.3K from viral series this month",
      icon: "sparkles",
      color: "primary",
    },
    {
      id: 5,
      name: "Horror Hub",
      action: "generated 7-episode mystery series",
      icon: "sparkles",
      color: "secondary",
    },
    {
      id: 6,
      name: "Alex T.",
      action: "gained 50K followers using MiniDrama",
      icon: "trending",
      color: "info",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % proofItems.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [proofItems.length]);

  const getIcon = (icon: string) => {
    switch (icon) {
      case "sparkles":
        return <Sparkles className="w-4 h-4" />;
      case "trending":
        return <TrendingUp className="w-4 h-4" />;
      case "users":
        return <Users className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case "primary":
        return "bg-primary/10 text-primary border-primary/20";
      case "secondary":
        return "bg-secondary/10 text-secondary border-secondary/20";
      case "info":
        return "bg-info/10 text-info border-info/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">Live Activity</span>
          </div>
        </div>

        <div className="relative h-20 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className={`
                flex items-center gap-3 px-6 py-4 rounded-xl border backdrop-blur-sm
                ${getColorClasses(proofItems[currentIndex].color)}
              `}
            >
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                {getIcon(proofItems[currentIndex].icon)}
              </motion.div>
              <p className="text-sm font-medium">
                <span className="font-bold">{proofItems[currentIndex].name}</span> just{" "}
                {proofItems[currentIndex].action}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {proofItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-primary w-8"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to item ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
