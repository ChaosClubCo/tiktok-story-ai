import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface NicheSelectorProps {
  selectedNiche: string | null;
  onNicheSelect: (niche: string) => void;
}

const niches = [
  { 
    id: "dating", 
    name: "💕 Dating", 
    description: "Romance gone wrong, love triangles, toxic relationships",
    color: "from-pink-500 to-red-500"
  },
  { 
    id: "horror", 
    name: "👻 Horror", 
    description: "Jump scares, creepy encounters, supernatural events",
    color: "from-purple-600 to-black"
  },
  { 
    id: "revenge", 
    name: "⚡ Revenge", 
    description: "Payback stories, karma moments, justice served",
    color: "from-orange-500 to-red-600"
  },
  { 
    id: "npc", 
    name: "🤖 NPC", 
    description: "Glitchy characters, simulation theory, meta humor",
    color: "from-blue-500 to-cyan-500"
  },
  { 
    id: "cringe", 
    name: "😬 Cringe", 
    description: "Awkward moments, social fails, secondhand embarrassment",
    color: "from-yellow-500 to-orange-500"
  }
];

export const NicheSelector = ({ selectedNiche, onNicheSelect }: NicheSelectorProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center bg-gradient-drama bg-clip-text text-transparent">
        Choose Your Drama Niche
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {niches.map((niche) => (
          <Card 
            key={niche.id}
            className={`p-6 cursor-pointer transition-all duration-300 hover:scale-105 border-2 ${
              selectedNiche === niche.id 
                ? 'border-primary shadow-glow bg-gradient-card' 
                : 'border-border/50 bg-card/50 hover:border-primary/50'
            }`}
            onClick={() => onNicheSelect(niche.id)}
          >
            <div className="text-center space-y-3">
              <div className="text-3xl mb-2">{niche.name.split(' ')[0]}</div>
              <h3 className="font-bold text-lg">{niche.name.split(' ').slice(1).join(' ')}</h3>
              <p className="text-sm text-muted-foreground">{niche.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};