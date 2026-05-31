import React from "react";
import WorldMap3D from "@/components/WorldMap3D";
import Badge from "@/components/ui/Badge";
import AppLayout from "@/components/AppLayout";
// Import other UI modules as needed

const DashboardPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="flex flex-col items-center w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
        {/* Header */}
        <header className="w-full max-w-4xl mx-auto py-8 px-4 flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 mb-2 tracking-tight">歡迎回來！</h1>
          <p className="text-lg text-gray-700 mb-4">探索你的語音冒險世界，完成任務獲取獎勵！</p>
          <Badge className="mb-2" label="語音小勇士" />
        </header>
        {/* Mission Map */}
        <section className="w-full max-w-5xl flex flex-col items-center mb-8">
          <WorldMap3D />
        </section>
        {/* Bottom Navigation Bar (if any) */}
        {/* ...other dashboard modules, e.g. progress, rewards, etc. */}
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
