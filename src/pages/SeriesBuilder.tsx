import { Header } from "@/components/Header";
import { SeriesBuilderFlow } from "@/components/SeriesBuilderFlow";

export default function SeriesBuilder() {
  return (
    <div className="min-h-screen bg-background-base">
      <Header />
      <SeriesBuilderFlow />
    </div>
  );
}
