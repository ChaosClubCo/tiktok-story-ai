import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

export const DifferentiationTable = () => {
  const features = [
    { name: "Single Script Generation", others: true, us: true },
    { name: "Series Generation (5-10 Episodes)", others: false, us: true },
    { name: "Real-Time Trend Integration", others: false, us: true },
    { name: "Viral Prediction Engine", others: false, us: true },
    { name: "Team Collaboration", others: false, us: true },
    { name: "Visual Hook Generation", others: false, us: true },
    { name: "POV Template Library", others: false, us: true },
    { name: "Multi-Platform Adaptation", others: false, us: true },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-drama bg-clip-text text-transparent">
            Why Creators Choose MiniDrama
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We're not just another script generator. We're your complete content empire builder.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-card border border-border rounded-2xl overflow-hidden shadow-elevated"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-6 text-foreground font-semibold">Feature</th>
                  <th className="text-center p-6 text-muted-foreground font-medium w-40">
                    Other Tools
                  </th>
                  <th className="text-center p-6 font-semibold w-40 relative">
                    <div className="bg-gradient-drama bg-clip-text text-transparent">
                      MiniDrama
                    </div>
                    <div className="absolute inset-0 bg-gradient-drama opacity-5 rounded-t-2xl" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <motion.tr
                    key={feature.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    <td className="p-6 text-foreground">{feature.name}</td>
                    <td className="text-center p-6">
                      {feature.others ? (
                        <Check className="inline-block w-5 h-5 text-success" />
                      ) : (
                        <X className="inline-block w-5 h-5 text-muted-foreground/40" />
                      )}
                    </td>
                    <td className="text-center p-6 relative">
                      {feature.us && (
                        <motion.div
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: index * 0.05 + 0.2 }}
                        >
                          <Check className="inline-block w-5 h-5 text-primary" />
                        </motion.div>
                      )}
                      <div className="absolute inset-0 bg-gradient-drama opacity-5" />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-muted-foreground">
            Join 30,000+ creators building content empires, not just viral videos
          </p>
        </motion.div>
      </div>
    </section>
  );
};
